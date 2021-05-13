import _ from "lodash";
import React, { Fragment } from "react";

import { textLightColor } from "src/core/color_defs.js";
import { is_IE } from "src/core/feature_detection.js";

import { lang, is_a11y_mode } from "src/core/injected_build_constants.js";

import { IconDownload } from "src/icons/icons.js";
import { get_static_url } from "src/request_utils.js";

import { create_text_maker_component } from "./misc_util_components.js";
import { SpinnerWrapper } from "./SpinnerWrapper/SpinnerWrapper.js";

import text from "./PDFGenerator.yaml";

const { text_maker } = create_text_maker_component(text);

// USAGE NOTE:
// This component is somewhat generalized, but was developed primarily for printing panels and is untested elsewhere.
// Use with caution, and note that it already contains a lot of code for handling secial cases that occur in panels.
// If you need to cover further special cases, do it carefully.
export class PDFGenerator extends React.Component {
  constructor(props) {
    super();
    this.props = props;
    this.current_height = 0;

    this.state = {
      dependencies: false,
      generating_pdf: false,
    };
  }

  componentDidUpdate() {
    const { generating_pdf, dependencies } = this.state;

    if (generating_pdf) {
      if (dependencies) {
        this.generate_and_download_pdf(dependencies);
      } else {
        this.lazy_load_heavy_dependencies();
      }
    }
  }

  lazy_load_heavy_dependencies() {
    // these node modules are huge and ony needed if/when a user actually goes to download a panel. Lazy loaded to save ~700KiB until needed
    import(
      "./PDFGenerator_lazy_loaded_dependencies.side-effects.js"
    ).then((dependencies) => this.setState({ dependencies }));
  }

  generate_and_download_pdf({ jsPDF, qrcode, html2canvas }) {
    const {
      dom_element,
      target_id,
      link,
      include_footer,
      title,
      file_name,
    } = this.props;

    const element_to_print =
      !dom_element && target_id
        ? document
            .getElementById(target_id)
            .getElementsByClassName("panel-body")[0]
        : dom_element;

    const today = new Date();
    const date_fmt = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;
    const pdf_file_name = file_name ? file_name : `${date_fmt}.pdf`;

    const pdf = new jsPDF({
      compress: true,
      format: "letter",
    });
    const width = pdf.internal.pageSize.getWidth();
    const FOOTER_HEIGHT = link || include_footer ? 27 : 0;
    const EXTRA_HEIGHT = 20;
    const TITLE_HEIGHT = title ? 11 : 0;

    const get_text_height = (pdf, text) => {
      // Getting width of the text string to estimate the height of the text (number of lines)
      const textHeight = pdf.getTextWidth(text) / 25;
      return textHeight < 10
        ? 10
        : textHeight > 10 && textHeight < 20
        ? 20
        : textHeight;
    };

    const setup_pdf_title = (pdf, title, width) => {
      if (title) {
        pdf.setFont("helvetica", "bold");
        pdf.setLineWidth(1);
        pdf.text(2, 10, title);
        pdf.line(0, 12, width, 12, "F");
        this.current_height = TITLE_HEIGHT;
      }
    };

    const setup_pdf_footer = (pdf, width) => {
      if (link || include_footer) {
        const footerImg = new Image();
        footerImg.src = get_static_url(`png/wmms-blk.png`);
        this.current_height += 15 + EXTRA_HEIGHT;
        pdf.addImage(footerImg, "png", 174.5, this.current_height);

        this.current_height += 11;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(
          `${text_maker("pdf_retrieved_date")} ${date_fmt}`,
          width / 2 - 25,
          this.current_height
        );
      }
      if (link) {
        const qr = qrcode(0, "L");
        qr.addData(link);
        qr.make();
        const qrCodeImg = qr.createDataURL();

        this.current_height -= 26;
        pdf.addImage(qrCodeImg, "JPEG", 1, this.current_height);

        const langUrl = lang === "en" ? "gcinfobase" : "infobasegc";
        this.current_height += 26;
        pdf.textWithLink(`canada.ca/${langUrl}`, 2.5, this.current_height, {
          url: link,
        });
      }
    };
    const pdf_end_util = () => {
      this.setState({ generating_pdf: false });
    };

    if (is_a11y_mode) {
      setup_pdf_title(pdf, title, width);
      this.current_height += 2;
      const textElements = _.map(
        element_to_print.querySelectorAll("p,ul"),
        _.identity
      );
      _.forEach(textElements, (text) => {
        if (text.tagName === "UL") {
          _.forEach(_.map(text.children, _.identity), (li) => {
            pdf.fromHTML(li, 10, this.current_height, { width: width });
            this.current_height += get_text_height(pdf, li.innerText);
          });
        } else {
          pdf.fromHTML(text, 1, this.current_height, { width: width });
          this.current_height += get_text_height(pdf, text.innerText);
        }
      });

      const tables = _.map(
        element_to_print.getElementsByTagName("table"),
        _.identity
      );
      _.forEach(tables, (tbl) => {
        pdf.autoTable({
          startY: this.current_height,
          html: tbl,
        });
        this.current_height = pdf.previousAutoTable.finalY + 10;
      });
      if (
        !(
          pdf.internal.pageSize.getHeight() - this.current_height <
          FOOTER_HEIGHT
        )
      ) {
        this.current_height =
          this.current_height +
          (pdf.internal.pageSize.getHeight() - this.current_height) -
          FOOTER_HEIGHT -
          EXTRA_HEIGHT;
        setup_pdf_footer(pdf, width);
      }
      pdf.save(pdf_file_name);
      pdf_end_util();
    } else {
      // When the list of legend items are too long such that the items don't all fit into the defined max height, scroll is created to contain them.
      // Screenshotting that will cause items to overflow, hence below sets max height to a big arbitrary number which later gets set back to original.
      const legend_container_arr = element_to_print.getElementsByClassName(
        "standard-legend-container"
      );

      const MAX_DIV_HEIGHT = "9999px";
      var oldMaxHeights = _.map(
        legend_container_arr,
        (legend_container) => legend_container.style.maxHeight
      );
      _.forEach(legend_container_arr, (legend_container) => {
        legend_container.style.maxHeight = MAX_DIV_HEIGHT;
      });

      // Img tags are not properly captured, hence needs to be temporarily converted to canvas for pdf purposes only
      const imgElements = _.map(
        element_to_print.getElementsByTagName("img"),
        _.identity
      );
      _.forEach(imgElements, (img) => {
        const parentNode = img.parentNode;

        const canvas = document.createElement("canvas");
        canvas.className = "canvas-temp";
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Save all img style to canvas
        canvas.data = img.style.cssText;
        img.style.width = 0;
        img.style.height = 0;

        parentNode.appendChild(canvas);
      });

      html2canvas(element_to_print, { logging: false })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const ratio = canvas.height / canvas.width;
          const page_height = ratio * width;

          pdf.internal.pageSize.setHeight(
            page_height + FOOTER_HEIGHT + EXTRA_HEIGHT + TITLE_HEIGHT
          );

          setup_pdf_title(pdf, title, width);

          this.current_height += page_height;
          pdf.addImage(
            imgData,
            "JPEG",
            0,
            TITLE_HEIGHT + 1,
            width,
            this.current_height
          );
          setup_pdf_footer(pdf, width);
          pdf.save(pdf_file_name);
        })
        .then(() => {
          _.forEach(imgElements, (img) => {
            const parentNode = img.parentNode;
            const canvas = parentNode.getElementsByClassName("canvas-temp")[0];

            // Restore original img style
            img.style.cssText = canvas.data;
            parentNode.removeChild(canvas);
          });

          _.forEach(
            legend_container_arr,
            (legend_container, index) =>
              (legend_container.style.maxHeight = oldMaxHeights[index])
          );

          pdf_end_util();
        });
    }
  }

  render() {
    const { generating_pdf } = this.state;
    const {
      button_class_name,
      icon_color,
      icon_alternate_color,
      icon_size,
    } = this.props;

    return (
      !is_IE() && (
        <Fragment>
          {!generating_pdf && (
            <button
              onClick={() => this.setState({ generating_pdf: true })}
              className={button_class_name}
            >
              <IconDownload
                title={text_maker("download_pdf")}
                color={icon_color}
                alternate_color={icon_alternate_color}
                width={icon_size}
                height={icon_size}
              />
            </button>
          )}
          {generating_pdf && (
            <SpinnerWrapper
              config_name={"small_inline"}
              title={text_maker("downloading_pdf")}
              alt={text_maker("downloading_pdf")}
            />
          )}
        </Fragment>
      )
    );
  }
}
PDFGenerator.defaultProps = {
  icon_color: textLightColor,
  icon_alternate_color: false,
};
