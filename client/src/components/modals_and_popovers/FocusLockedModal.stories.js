import { useArgs } from "@storybook/client-api";
import React, { Fragment } from "react";

import { FocusLockedModal } from "./FocusLockedModal";

export default {
  title: "modals and popovers/FocusLockedModal",
  component: FocusLockedModal,

  // Need decorators to use useArgs()
  decorators: [(Story) => <div>{Story()}</div>],
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();
  function on_exit() {
    console.log(args.mounted ? "Closing Modal" : "Opening Modal");
    updateArgs({ ...args, mounted: !args.mounted });
  }

  return (
    <Fragment>
      <div id="ib-site-header-area" />
      <div style={{ height: "500vh" }}>
        {" "}
        Switch mounted control to focus
        <div>
          {args.mounted ? null : (
            <button onClick={on_exit}>Click to open modal</button>
          )}
        </div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eget
        nisl nec tortor posuere porttitor et sit amet arcu. Aliquam bibendum eu
        ex vulputate facilisis. Fusce id posuere urna, id hendrerit ipsum.
        Vivamus non felis in sapien pellentesque porta. Mauris a malesuada odio.
        Etiam sed arcu sit amet ex dictum rutrum eu et turpis. Vestibulum est
        ante, aliquet at magna eu, sollicitudin facilisis ipsum. Cras quis
        commodo dolor. Vivamus volutpat elit nec leo rutrum tempus. Sed eget
        sodales quam. Aliquam sodales pretium massa, in molestie eros sagittis
        venenatis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
        cursus pretium purus in commodo. Curabitur metus dui, accumsan sodales
        maximus id, lobortis nec orci. Nunc sodales nunc lorem, ac sollicitudin
        purus pharetra in. Cras laoreet, tellus eget iaculis rhoncus, metus nisl
        ullamcorper elit, egestas feugiat urna augue quis leo. Nulla ut lectus
        semper metus aliquam laoreet nec et justo. Praesent eget nunc nec lectus
        suscipit semper sit amet eget ante. Aenean fringilla quis purus vel
        molestie. Curabitur nec mauris ac mauris ultricies viverra at vel erat.
        Praesent quis urna sed nisl sagittis condimentum. Sed laoreet elit enim,
        id tincidunt justo commodo et. Phasellus a quam quam. Nam eu fermentum
        enim. Mauris accumsan urna a tortor venenatis luctus. Orci varius
        natoque penatibus et magnis dis parturient montes, nascetur ridiculus
        mus. Pellentesque finibus nibh at hendrerit sodales. Phasellus vel justo
        rutrum, dapibus lectus vel, hendrerit erat. Donec dapibus a leo
        ultricies tincidunt. Nunc quis nibh sit amet augue egestas rutrum id et
        nulla. Aliquam posuere lacus et neque maximus pellentesque. Vivamus
        neque nulla, mattis egestas accumsan vitae, pellentesque a lectus. Sed
        in ex et justo mollis rutrum sed id ipsum. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Aenean dolor orci, fringilla a nisi
        fermentum, vehicula sollicitudin felis. Donec auctor vulputate sagittis.
        Praesent feugiat nunc nec posuere hendrerit. Pellentesque sodales mauris
        et felis tincidunt, ut laoreet dui congue. Etiam ultricies nunc quis
        velit pulvinar, et dapibus massa tristique. Suspendisse potenti.
        Praesent eu neque id risus sollicitudin gravida a non ligula. In hac
        habitasse platea dictumst. Ut suscipit quis tortor ut lacinia. Cras a
        mauris et metus lacinia hendrerit eu et nulla. Vivamus et posuere sem,
        nec mattis risus. Maecenas ultricies nunc felis, eget malesuada turpis
        vestibulum eu. Integer lobortis massa ut felis cursus auctor. Integer
        sapien neque, lacinia a turpis ac, placerat iaculis nibh. Fusce eros
        felis, porttitor sit amet blandit sed, lacinia et nibh. Vestibulum ante
        ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
      </div>

      <div
        id="wb-info"
        style={{ height: "300px", borderTop: "2px black solid" }}
      />
      <FocusLockedModal {...args} on_exit={on_exit} />
    </Fragment>
  );
};

export const Basic = Template.bind({});
Basic.args = {
  // text
  children: <div>Focused Modal</div>,
  aria_label: "",

  // booleans
  mounted: false,

  // css
  additional_dialogue_class: "",
};
