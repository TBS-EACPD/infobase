import get_home_content from './home-data.js';
import { log_standard_event } from '../core/analytics.js';

require('./home.scss');
require('./home-pngs.css');

const MediaQuery = require('react-responsive');
const classNames = require('classnames');
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


const {
  TM,
  SpinnerWrapper,
} = require('../util_components.js');


const { ensure_loaded } = require('../core/lazy_loader.js');
const { ResultCounts } = require('../models/results.js');
const { Table } = require('../core/TableClass.js');

const { StandardRouteContainer } = require('../core/NavComponents.js');

const HImageCard = ({
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
}) => (
  <div className="h-img-card col-content-child">
    <div className="h-img-card__right-container">
      <div className="h-img-card__right">
        <header className="h-img-card__title">
          <TM k={title_key}/>
        </header>
        <div className="h-img-card__text">
          <TM k={text_key} args={text_args} />
        </div>
        <div className="h-img-card__bottom-right">
          <a href={link_href}>
            <TM k={link_key} /> →
          </a>
        </div>
      </div>
    </div>
  </div>
)

const VImageCard = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
}) => (
  <div className="v-img-card col-content-child">
    <div className="v-img-card__top-container">
      <div aria-hidden={true} className="v-img-card__top">
        <a className="v-img-card__img-link" href={link_href}>
          <img src={img_src} className="v-img-card__img" />
        </a>
      </div>
    </div>
    <div className="v-img-card__bottom-container">
      <div className="v-img-card__bottom">
        <header className="v-img-card__title">
          <TM k={title_key} />
        </header>
        <div className="v-img-card__text">
          <TM k={text_key} />
        </div>

        <div className="v-img-card__bottom-right">
          <a href={link_href}><TM k={link_key} /></a>
        </div>
      </div>
    </div>
  </div>
);


export class Home extends React.Component {
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

    const { featured_content_items } = get_home_content();

    if(this.state.loading){
      return (
        <StandardRouteContainer route_key="start">
          <SpinnerWrapper scale={4} />
        </StandardRouteContainer>
      );
    } else {
      const table5 = Table.lookup('table5');
      const table10 = Table.lookup('table10');
      const { drr16_past_total, drr16_indicators_past_success }= ResultCounts.get_gov_counts();

     
      return (
        <StandardRouteContainer route_key="start">
          <MediaQuery minWidth={992}>
            {is_large =>
              <div> 
                <HomeLayout
                  past_targets_met={drr16_indicators_past_success}
                  past_targets_total={drr16_past_total}
                  spent_last_year={table5.col_from_nick('{{pa_last_year}}').formula(table5.data)}
                  headcount_last_year={table10.col_from_nick('{{ppl_last_year}}').formula(table10.data)}
                  is_large={is_large}
                  featured_content_items={featured_content_items}
                />
              </div>
            }
          </MediaQuery>
        </StandardRouteContainer>
      );

    }
  }

}

const FeaturedContentItem = ({ text_key, href, is_new }) => <li className="list-group-item list-group-item--is-darkened">
  { is_new && <span className="badge badge--is-new"> new </span> }
  <a href={href}> <TM k={text_key} /> </a>
</li>;


const HomeLayout = props => (
  <div className="home-root">
    <div className="intro-box">
      <h1> <TM k="welcome" /> </h1>
      <h2> <TM k="home_sub_title" /> </h2>
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
          onNewQuery={ query => { 
            log_standard_event({
              SUBAPP: "home",
              SUBJECT_GUID: null, 
              MISC1: "home_search",
              MISC2: query,
            });
          }}
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

    {/* same content (finance, people, results), but for mobile */}
    {!props.is_large && 
      <div className={classNames("equal-height-row equal-height-row--home-row")}>
        <div className="equal-height-col is-1-third">
          <div className="col-content misc-col-content">
            <HImageCard
              link_href="#orgs/gov/gov/infograph/financial"
              title_key="home_finance_title"
              text_key="home_finance_intro"
              link_key="home_finance_link"
              text_args={props}
            />
          </div>
        </div>
        <div className="equal-height-col is-1-third">
          <div className="col-content misc-col-content">
            <HImageCard
              link_href="#orgs/gov/gov/infograph/people"
              title_key="home_ppl_title"
              text_key="home_ppl_intro"
              link_key="home_ppl_link"
              text_args={props}
            />
          </div>
        </div>
        <div className="equal-height-col is-1-third">
          <div className="col-content misc-col-content">
            <HImageCard
              link_href="#orgs/gov/gov/infograph/results"
              title_key="home_results_title"
              text_key="home_results_intro"
              link_key="home_results_link"
              text_args={props}
            />
          </div>
        </div>
      </div>
    }

    <div className="external-row-descriptor">
      <TM k="home_featured_row_title" />
    </div>
    <div className="equal-height-row equal-height-row--home-row">
      <div aria-hidden={true} className="equal-height-col is-1-third">
        <div className="col-content featured-col-content">
          <VImageCard
            img_src="./png/partition.png"
            title_key="partition_home_title"
            text_key="partition_home_text"
            link_key="check_home_link"
            link_href="#partition/dept/exp"
          />
        </div>
      </div>
      <div aria-hidden={true} className="equal-height-col is-1-third">
        <div className="col-content featured-col-content">
          <VImageCard
            img_src="./png/bubbles.png"
            title_key="planet_home_title"
            text_key="planet_home_text"
            link_key="check_home_link"
            link_href="#explore-dept"
          />
        </div>
      </div>
      <div className="equal-height-col is-1-third">
        <section style={{padding:"10px"}} className="col-content featured-col-content">
          <header className="h3" style={{textAlign:'center', marginTop: "15px"}}>
            <TM k="featured_data_title" />
          </header>
          <div style={{margin: 'auto 0'}}> {/* center in between title and bottom */}
            <ul className="list-group list-group--quick-links">
              { _.map( props.featured_content_items, item => <FeaturedContentItem key={item.text_key} {...item} /> ) }
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
          <VImageCard
            img_src="./png/explorer.png"
            title_key="explorer_home_title"
            text_key="explorer_home_text"
            link_key="start_exp_link"
            link_href="#resource-explorer"
          />
        </section>
      </div>
      <div className="equal-height-col is-1-third">
        <section className="col-content explore-col-content">
          <VImageCard
            img_src="./png/Builder.png"
            title_key="home_build_a_report"
            text_key="report_builder_home_desc"
            link_key="start_build_link"
            link_href="#rpb"
          />
        </section>
      </div>
      <div className="equal-height-col is-1-third">
        <section className="col-content explore-col-content">
          <VImageCard
            img_src="./png/structure_panel.png"
            title_key="igoc_home_title"
            text_key="igoc_home_desc"
            link_key="start_search_link"
            link_href="#igoc"
          />
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
                  <TM k="glossary_home_title" /> 
                </header>

                <div className="h-img-card__text">
                  <TM k="glossary_home_desc" /> 
                </div>

                <div className="h-img-card__bottom-right">
                  <a href="#glossary"> <TM k="glossary_home_link_text" /> </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="equal-height-col is-1-third">
        <section className="col-content misc-col-content">
          <HImageCard
            link_href="#metadata"
            title_key="metadata_home_title"
            text_key="metadata_home_desc"
            link_key="metadata_home_link_text"
          />
        </section>
      </div>

      <div className="equal-height-col is-1-third">
        <section className="col-content misc-col-content">
          <HImageCard
            link_href={"#about"}
            title_key="about_home_title"
            text_key="about_home_desc"
            link_key="about_home_link"
          />
        </section>
      </div>
    </div> 
  </div>
);
