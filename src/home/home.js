const ROUTER = require('../core/router.js');
const MediaQuery = require('react-responsive');
const classNames = require('classnames');
const { reactAdapter } = require('../core/reactAdapter.js');
const { 
  EverythingSearch,
} = require('../util_components.js');
const {
  general_href_for_item,
} = require('../link_utils.js');

const {
  text_maker,
} = require('../models/text.js');
require("./home.ib.yaml");

require('./home.scss');
require('./home-pngs.css');

const {
  TextMaker,
  TM,
  SpinnerWrapper,
} = require('../util_components.js');

const {
  rpb_link,
} = require('../rpb/rpb_link.js');

const { ensure_loaded } = require('../core/lazy_loader.js');
const { ResultCounts } = require('../models/results.js');
const { Table } = require('../core/TableClass.js');



ROUTER.add_default_route( "start", "start", function route_func(container){
  this.add_crumbs();
  const empty = document.createElement('span');
  this.add_title(empty);
  reactAdapter.render(<Container />, container);
})


class Container extends React.Component {
  constructor(){
    super()
    this.state = { loading: true};
  }
  componentDidMount(){
    ensure_loaded({
      table_keys: ['table5','table10'],
      info_deps: [ 
        'table10_gov_info',
        'stat_keys',
      ],
      require_result_counts: true,
    }).then( ()=> { 
      this.setState({loading: false}) 
    })

  }
  render(){
    if(this.state.loading){
      return <SpinnerWrapper scale={4} />;
    } else {
      const table5 = Table.lookup('table5');
      const table10 = Table.lookup('table10');
      const { drr16_past_total, drr16_indicators_past_success }= ResultCounts.get_gov_counts();

     
      return (
        <MediaQuery minWidth={992}>
          {is_large =>  
            <HomeLayout
              past_targets_met={drr16_indicators_past_success}
              past_targets_total={drr16_past_total}
              spent_last_year={table5.col_from_nick('{{pa_last_year}}').formula(table5.data)}
              headcount_last_year={table10.col_from_nick('{{ppl_last_year}}').formula(table10.data)}
              is_large={is_large}
            />
          }
        </MediaQuery>
      );

    }
  }

}

const FeaturedContentItem = ({ text_key, href, is_new }) => <li className="list-group-item list-group-item--is-darkened">
  { is_new && <span className="badge badge--is-new"> new </span> }
  <a href={href}> <TextMaker text_key={text_key} /> </a>
</li>;

const featured_content_items = [
  {
    text_key: "DRR_1617",
    href: rpb_link({ 
      table: 'table12', 
      columns: ['{{pa_last_year}}'], 
      dimension: "gov_goco",
    }),
    is_new: true,
  },
  {
    text_key: "supps_b",
    href: rpb_link({ 
      table: 'table8', 
      columns: [ "{{est_in_year}}_estimates"], 
      dimension: 'by_estimates_doc', 
      filter: ({ //TODO: D.R.Y this against table8
        "en":"Supp. Estimates B",
        "fr":"Budget supp. B",
      })[window.lang],
    }),
    is_new: true,
  },
  {
    text_key:"table4_home_link",
    href: rpb_link({ 
      table: 'table4', 
      columns: ['{{pa_last_year}}auth','{{pa_last_year}}exp'], 
      mode: 'details',
    }),
  },
  {
    text_key: "DP_1718",
    href: rpb_link({ 
      table: 'table6', 
      columns: ['{{planning_year_1}}'], 
      dimension: "gov_goco",
    }),
  },
  {
    text_key: 'main_estimates',
    href: rpb_link({
      table: 'table8', 
      columns: [ "{{est_in_year}}_estimates"], 
      dimension: 'by_estimates_doc', 
      filter: ({ //TODO: D.R.Y this against table8
        "en":"Main Estimates",
        "fr":"Budget principal",
      })[window.lang],
    }),
  },
  { 
    text_key: 'prog_by_vote_stat',
    href : rpb_link({ 
      table: 'table300', 
      mode: 'details',
    }),
  },
  { 
    text_key: 'prog_by_so',
    href : rpb_link({ 
      table: 'table305', 
      mode: 'details',
    }),
  },
];


const HomeLayout = props => (
  <div className="home-root">
    <div className="intro-box">
      <h1> <TextMaker text_key="welcome" /> </h1>
      <h2> <TextMaker text_key="home_sub_title" /> </h2>
      <div className="search-box"><div className="search-container">
        <EverythingSearch 
          include_gov={false} 
          search_text={text_maker('everything_search_placeholder')}
          large={true}
          include_tags={true}
          include_programs={true}
          include_crsos={true}
          include_tables={true} 
          include_glossary={true}
          org_scope="orgs_with_data_with_gov"
          href_template={ general_href_for_item }
        />
      </div></div>

      { props.is_large && 
        <div 
          aria-hidden={true}
          className="equal-height-row equal-height-row--home-row"
        >
          <div className="equal-height-col is-1-third no-gutter">
            <div className="col-content">
              <a
                href="#orgs/gov/gov/infograph/financial"
                className="h-img-card finance-box col-content-child link-unstyled"
              >
                <div className="h-img-card__right-container">
                  <div className="h-img-card__right">
                    <div className="h-img-card__title">
                      <TM k="home_finance_title" />
                    </div>

                    <div className="h-img-card__text">
                      <TM k="home_finance_intro" args={props} />
                    </div>

                    <div className="h-img-card__bottom-right">
                      <TM k="home_finance_link" /> →
                    </div>
                  </div>
                </div>
      
              </a>
            </div>
          </div>
          <div className="equal-height-col is-1-third no-gutter">
            <div className="col-content">
              <a
                href="#orgs/gov/gov/infograph/people"
                className="h-img-card people-box col-content-child link-unstyled"
              >
                <div className="h-img-card__right-container">
                  <div className="h-img-card__right">
                    <div className="h-img-card__title">
                      <TM k="home_ppl_title"  />
                    </div>

                    <div className="h-img-card__text">
                      <TM k="home_ppl_intro" args={props} />
                    </div>

                    <div className="h-img-card__bottom-right">
                      <TM k="home_ppl_link"/> →
                    </div>
                  </div>
                </div>
      
              </a>
            </div>
          </div>
          <div className="equal-height-col is-1-third no-gutter">
            <div className="col-content">
              <a
                href="#orgs/gov/gov/infograph/results"
                className="h-img-card results-box col-content-child link-unstyled"
              >
                <div className="h-img-card__right-container">
                  <div className="h-img-card__right">
                    <div className="h-img-card__title">
                      <TM k="home_results_title" />
                    </div>

                    <div className="h-img-card__text">
                      <TM k="home_results_intro" args={props} />
                    </div>

                    <div className="h-img-card__bottom-right">
                      <TM k="home_results_link" /> →
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      }
    </div>

    {/* same content (finance, people, results), but different structure than what's above in the intro box */}
    <div className={classNames("equal-height-row equal-height-row--home-row", props.is_large && "sr-only")}>
      <div className="equal-height-col is-1-third">
        <div className="col-content misc-col-content">
          <div className="h-img-card col-content-child">
            <div className="h-img-card__right-container">
              <div className="h-img-card__right">
                <header className="h-img-card__title">
                  <TM k="home_finance_title" />
                </header>

                <div className="h-img-card__text">
                  <TM k="home_finance_intro" args={props} />
                </div>

                <div className="h-img-card__bottom-right">
                  <a href="#orgs/gov/gov/infograph/financial">
                    <TM k="home_finance_link" /> →
                  </a>
                </div>
              </div>
            </div>
  
          </div>
        </div>
      </div>
      <div className="equal-height-col is-1-third">
        <div className="col-content misc-col-content">
          <div className="h-img-cardcol-content-child">
            <div className="h-img-card__right-container">
              <div className="h-img-card__right">
                <header className="h-img-card__title">
                  <TM k="home_ppl_title"  />
                </header>

                <div className="h-img-card__text">
                  <TM k="home_ppl_intro" args={props} />
                </div>

                <div className="h-img-card__bottom-right">
                  <a href="#orgs/gov/gov/infograph/people">
                    <TM k="home_ppl_link"/> →
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className="equal-height-col is-1-third">
        <div className="col-content misc-col-content">
          <div className="h-img-card col-content-child" >
            <div className="h-img-card__right-container">
              <div className="h-img-card__right">
                <header className="h-img-card__title">
                  <TM k="home_results_title" />
                </header>

                <div className="h-img-card__text">
                  <TM k="home_results_intro" args={props} />
                </div>

                <div className="h-img-card__bottom-right">
                  <a href="#orgs/gov/gov/infograph/results">
                    <TM k="home_results_link" /> →
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div className="external-row-descriptor">
      <TM k="home_featured_row_title" />
    </div>
    <div className="equal-height-row equal-height-row--home-row">
      <div aria-hidden={true} className="equal-height-col is-1-third">
        <div className="col-content featured-col-content">
          <div className="v-img-card col-content-child">
            <div className="v-img-card__top-container">
              <div aria-hidden={true} className="v-img-card__top">
                <a className="v-img-card__img-link" href="#partition/dept/exp">
                  <img src="./png/partition.png" className="v-img-card__img" />
                </a>
              </div>
            </div>
            <div className="v-img-card__bottom-container">
              <div className="v-img-card__bottom">
                <header className="v-img-card__title">
                  <TM k="partition_home_title" />
                </header>
                <div className="v-img-card__text">
                  <TM k="partition_home_text" />
                </div>

                <div className="v-img-card__bottom-right">
                  <a href="#partition/dept/exp"><TM k="check_home_link" /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden={true} className="equal-height-col is-1-third">
        <div className="col-content featured-col-content">
          <div className="v-img-card col-content-child">
            <div className="v-img-card__top-container">
              <div aria-hidden={true} className="v-img-card__top">
                <a className="v-img-card__img-link" href="#explore-dept">
                  <img src="./png/bubbles.png" className="v-img-card__img" />
                </a>
              </div>
            </div>
            <div className="v-img-card__bottom-container">
              <div className="v-img-card__bottom">
                <header className="v-img-card__title">
                  <TM k="planet_home_title" />
                </header>
                <div className="v-img-card__text">
                  <TM k="planet_home_text" />
                </div>
                <div className="v-img-card__bottom-right">
                  <a href="#explore-dept"> <TM k="check_home_link" /> </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="equal-height-col is-1-third">
        <section style={{padding:"10px"}} className="col-content featured-col-content">
          <header className="h3" style={{textAlign:'center', marginTop: "15px"}}>
            <TM k="featured_data_title" />
          </header>
          <div style={{margin: 'auto 0'}}> {/* center in between title and bottom */}
            <ul className="list-group list-group--quick-links">
              { _.map( featured_content_items, item => <FeaturedContentItem key={item.text_key} {...item} /> ) }
            </ul>
          </div>
        </section>
      </div>
    </div>

    <div className="external-row-descriptor">
      <TM k="home_explore_row_title" />
    </div>
    <div className='equal-height-row equal-height-row--home-row'>
      <div className="equal-height-col is-1-third">
        <section className="col-content explore-col-content">
          <div className="v-img-card col-content-child">
            <div className="v-img-card__top-container">
              <div aria-hidden={true} className="v-img-card__top">
                <a className="v-img-card__img-link" href="#resource-explorer">
                  <img src="./png/explorer.png" className="v-img-card__img"  />
                </a>
              </div>
            </div>
            <div className="v-img-card__bottom-container">
              <div className="v-img-card__bottom">
                <header className="v-img-card__title">
                  <TextMaker text_key="explorer_home_title" />
                </header>

                <div className="v-img-card__text">
                  <TextMaker text_key="explorer_home_text" />
                </div>

                <div className="v-img-card__bottom-right">
                  <a href="#resource-explorer"> <TM k="start_exp_link" /> </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="equal-height-col is-1-third">
        <section className="col-content explore-col-content">
          <div className="v-img-card col-content-child">
            <div className="v-img-card__top-container">
              <div aria-hidden={true} className="v-img-card__top">
                <a className="v-img-card__img-link" href="#rpb">
                  <img src="./png/Builder.png" className="v-img-card__img" />
                </a>
              </div>
            </div>
            <div className="v-img-card__bottom-container">
              <div className="v-img-card__bottom">
                <header className="v-img-card__title">
                  <TextMaker text_key="home_build_a_report" />
                </header>

                <div className="v-img-card__text">
                  <TextMaker text_key="report_builder_home_desc" />
                </div>

                <div className="v-img-card__bottom-right">
                  <a href="#rpb"> <TM k="start_build_link" /> </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="equal-height-col is-1-third">
        <section className="col-content explore-col-content">
          <div className="v-img-card col-content-child">
            <div className="v-img-card__top-container">
              <div aria-hidden={true} className="v-img-card__top">
                <a className="v-img-card__img-link" href="#igoc">
                  <img src="./png/structure_panel.png" className="v-img-card__img" />
                </a>
              </div>
            </div>
            <div className="v-img-card__bottom-container">
              <div className="v-img-card__bottom">
                <header className="v-img-card__title">
                  <TextMaker text_key="igoc_home_title" />
                </header>

                <div className="v-img-card__text">
                  <TextMaker text_key="igoc_home_desc" />
                </div>

                <div className="v-img-card__bottom-right">
                  <a href="#igoc"><TM k="start_search_link" /> </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div className="external-row-descriptor">
      <TM k="home_misc_row_title" />
    </div>
    <div className='equal-height-row equal-height-row--home-row equal-height-row--has-descriptor'>

      <div className="equal-height-col is-1-third">
        <section className="col-content misc-col-content">
          <div className="h-img-card col-content-child">

            <div className="h-img-card__right-container">
              <div className="h-img-card__right">
                <header className="h-img-card__title">
                  <TextMaker text_key="glossary_home_title" /> 
                </header>

                <div className="h-img-card__text">
                  <TextMaker text_key="glossary_home_desc" /> 
                </div>

                <div className="h-img-card__bottom-right">
                  <a href="#glossary"> <TextMaker text_key="glossary_home_link_text" /> </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="equal-height-col is-1-third">
        <section className="col-content misc-col-content">
          <div className="h-img-card col-content-child">

            <div className="h-img-card__right-container">
              <div className="h-img-card__right">
                <header className="h-img-card__title">
                  <TextMaker text_key="metadata_home_title" />
                </header>

                <div className="h-img-card__text">
                  <TextMaker text_key="metadata_home_desc" />
                </div>

                <div className="h-img-card__bottom-right">
                  <a href="#metadata"> 
                    <TextMaker text_key="metadata_home_link_text" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="equal-height-col is-1-third">
        <section className="col-content misc-col-content">
          <div className="h-img-card col-content-child">

            <div className="h-img-card__right-container">
              <div className="h-img-card__right">
                <header className="h-img-card__title">
                  <TM k="feed_home_title" />
                </header>
                <div className="h-img-card__text">
                  <TM k="feed_home_text" />
                </div>
                <div className="h-img-card__bottom-right">
                  <a
                    target="_blank" 
                    href={text_maker("survey_link")}
                  >
                    <TM k="feed_home_link" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div> 
  </div>
);
