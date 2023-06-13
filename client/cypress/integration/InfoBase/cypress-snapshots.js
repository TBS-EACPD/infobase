module.exports = {
  "Route tests": {
    "Homepage": {
      "Tested on index-eng.html#start": {
        "Axe violations allow list": null
      },
      "Tested on index-fra.html#start": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#start": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-fra.html#start": {
        "Axe violations allow list": null
      }
    },
    "Glossary": {
      "Tested on index-eng.html#glossary": {
        "Axe violations allow list": {
          // Not shown until page scrolls, TODO: something about the way this is hidden pre-scroll is potentially an issue
          "color-contrast, serious": [
            "<button class=\"btn btn-ib-primary floating-button floating-button--fixed\" aria-label=\"Back to top\" style=\"top: auto;\">Back to top</button>"
          ]
        }
      },
      "Tested on index-basic-eng.html#glossary": {
        "Axe violations allow list": {
          // Not shown until page scrolls, TODO: something about the way this is hidden pre-scroll is potentially an issue
          "color-contrast, serious": [
            "<button class=\"btn btn-ib-primary floating-button floating-button--fixed\" aria-label=\"Back to top\" style=\"top: auto;\">Back to top</button>"
          ]
        }
      }
    },
    "Datasets": {
      "Tested on index-eng.html#datasets": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#datasets": {
        "Axe violations allow list": null
      }
    },
    "About": {
      "Tested on index-eng.html#about": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#about": {
        "Axe violations allow list": null
      }
    },
    "FAQ": {
      "Tested on index-eng.html#faq": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#faq": {
        "Axe violations allow list": null
      }
    },
    "Privacy": {
      "Tested on index-eng.html#privacy": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#privacy": {
        "Axe violations allow list": null
      }
    },
    "IGOC": {
      "Tested on index-eng.html#igoc": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#igoc": {
        "Axe violations allow list": null
      }
    },
    "Estimates Comparison": {
      "Tested on index-eng.html#compare_estimates": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#compare_estimates": {
        "Axe violations allow list": null
      }
    },
    "Tag Explorer": {
      "Tested on index-eng.html#tag-explorer": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#tag-explorer": {
        "Axe violations allow list": null
      }
    },
    "Report Builder - Table Picker": {
      "Tested on index-eng.html#rpb/.-.-(subject.-.-'gov_gov.-.-columns.-.-false)": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#rpb/.-.-(subject.-.-'gov_gov.-.-columns.-.-false)": {
        "Axe violations allow list": null
      }
    },
    "Report Builder - Report": {
      "Tested on index-eng.html#rpb/.-.-(table.-.-'orgEmployeeType.-.-subject.-.-'gov_gov.-.-columns.-.-(.-.-'*7b*7bppl_last_year_5*7d*7d.-.-'*7b*7bppl_last_year_4*7d*7d.-.-'*7b*7bppl_last_year_3*7d*7d.-.-'*7b*7bppl_last_year_2*7d*7d.-.-'*7b*7bppl_last_year*7d*7d.-.-'five_year_percent))": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#rpb/.-.-(table.-.-'orgEmployeeType.-.-subject.-.-'gov_gov.-.-columns.-.-(.-.-'*7b*7bppl_last_year_5*7d*7d.-.-'*7b*7bppl_last_year_4*7d*7d.-.-'*7b*7bppl_last_year_3*7d*7d.-.-'*7b*7bppl_last_year_2*7d*7d.-.-'*7b*7bppl_last_year*7d*7d.-.-'five_year_percent))": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Gov - About": {
      "Tested on index-eng.html#infographic/gov/gov/intro": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/gov/gov/intro": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Gov - Finance": {
      "Tested on index-eng.html#infographic/gov/gov/financial": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/gov/gov/financial": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Gov - COVID-19 Response": {
      "Tested on index-eng.html#infographic/gov/gov/covid": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/gov/gov/covid": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Gov - People": {
      "Tested on index-eng.html#infographic/gov/gov/people": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/gov/gov/people": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Gov - Services": {
      "Tested on index-eng.html#infographic/gov/gov/services": {
        "Axe violations allow list": {
          "color-contrast, serious": [
            // TODO is inside of/intersects with a tall height clipped table, false positives
            "<span>In person applications</span>",
            "<span class=\"infobase-pie__legend-data\">15,198,643</span>",
            "<span class=\"text-nowrap\">5.7%</span>",
            "<span>Applications by other channels</span>",
            "<span class=\"infobase-pie__legend-data\">8,777,551</span>",
            "<span class=\"text-nowrap\">3.3%</span>",
            "<span>Applications by telephone</span>",
            "<span class=\"infobase-pie__legend-data\">5,675,706</span>",
            "<span class=\"text-nowrap\">2.1%</span>",
            "<p>",
            "<span role=\"button\" tabindex=\"0\" class=\"glossary-sidebar-link\" data-ibtt-glossary-key=\"SERVICE\" data-toggle=\"glossary_sidebar\" aria-label=\"services, click to open glossary defintion for Service\">      services    </span>",
            "<span role=\"button\" tabindex=\"0\" class=\"glossary-sidebar-link\" data-ibtt-glossary-key=\"STANDARD\" data-toggle=\"glossary_sidebar\" aria-label=\"standards, click to open glossary defintion for Service Standard\">      standards    </span>",
            "<h4 style=\"text-align: center;\">844 / 1375</h4>",
            "<span class=\"text-nowrap\">61.4%</span>",
            "<span class=\"text-nowrap\">2,270</span>",
            "<p>How many service <span role=\"button\" tabindex=\"0\" class=\"glossary-sidebar-link\" data-ibtt-glossary-key=\"STANDARD\" data-toggle=\"glossary_sidebar\" aria-label=\"standards', click to open glossary defintion for Service Standard\">      standards'    </span> targets were met?</p>",
            "<span role=\"button\" tabindex=\"0\" class=\"glossary-sidebar-link\" data-ibtt-glossary-key=\"STANDARD\" data-toggle=\"glossary_sidebar\" aria-label=\"standards', click to open glossary defintion for Service Standard\">      standards'    </span>",
            "<h4 style=\"text-align: center;\">1373 / 2270</h4>",
            "<span class=\"text-nowrap\">60.5%</span>"
          ]
        }
      },
      "Tested on index-basic-eng.html#infographic/gov/gov/services": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Gov - Results": {
      "Tested on index-eng.html#infographic/gov/gov/results": {
        "Axe violations allow list": {
          "color-contrast, serious": [
            // TODO intersects with tall height clipped table, false positive
            "<span class=\"text-nowrap\">1,529</span>",
            "<span class=\"text-nowrap\">2,779</span>",
            "<strong>fall 2024</strong>"
          ]
        }
      },
      "Tested on index-basic-eng.html#infographic/gov/gov/results": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Gov - Where can I go from here?": {
      "Tested on index-eng.html#infographic/gov/gov/related": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/gov/gov/related": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Gov - All data": {
      "Tested on index-eng.html#infographic/gov/gov/all_data": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/gov/gov/all_data": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Dept - About": {
      "Tested on index-eng.html#infographic/dept/326/intro": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/326/intro": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Dept - Finance": {
      "Tested on index-eng.html#infographic/dept/326/financial": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/326/financial": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Dept - COVID-19 Response": {
      "Tested on index-eng.html#infographic/dept/1/covid": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/1/covid": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Dept - People": {
      "Tested on index-eng.html#infographic/dept/326/people": {
        "Axe violations allow list": null
      },
      "Tested on index-fra.html#infographic/dept/326/people": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/326/people": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Dept - Services": {
      "Tested on index-eng.html#infographic/dept/326/services": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/326/services": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Dept - Results": {
      "Tested on index-eng.html#infographic/dept/326/results": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/326/results": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Dept - Where can I go from here?": {
      "Tested on index-eng.html#infographic/dept/326/related": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/326/related": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Dept - All data": {
      "Tested on index-eng.html#infographic/dept/326/all_data": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/326/all_data": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Crown Corp - About": {
      "Tested on index-eng.html#infographic/dept/146/intro": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/146/intro": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Crown Corp - Finance": {
      "Tested on index-eng.html#infographic/dept/146/financial": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/146/financial": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Crown Corp - Where can I go from here?": {
      "Tested on index-eng.html#infographic/dept/146/related": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/dept/146/related": {
        "Axe violations allow list": null
      }
    },
    "Infographic - CRSO - About": {
      "Tested on index-eng.html#infographic/crso/TBC-BXA00/intro": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/crso/TBC-BXA00/intro": {
        "Axe violations allow list": null
      }
    },
    "Infographic - CRSO - Finance": {
      "Tested on index-eng.html#infographic/crso/TBC-BXA00/financial": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/crso/TBC-BXA00/financial": {
        "Axe violations allow list": null
      }
    },
    "Infographic - CRSO - Results": {
      "Tested on index-eng.html#infographic/crso/TBC-BXA00/results": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/crso/TBC-BXA00/results": {
        "Axe violations allow list": null
      }
    },
    "Infographic - CRSO - Where can I go from here?": {
      "Tested on index-eng.html#infographic/crso/TBC-BXA00/related": {
        "Axe violations allow list": {
          "color-contrast, serious": [
            // Within the faded area of a height clipper, intended
            "<a href=\"#infographic/program/TBC-BXB05\" tabindex=\"-999\">Acquired Services and Assets Policies and Initiatives</a>",
            "<a href=\"#infographic/program/TBC-BXB06\" tabindex=\"-999\">Digital Comptrollership Program</a>",
            "<a href=\"#infographic/program/TBC-BXB02\" tabindex=\"-999\">Digital Policy</a>",
            "<a href=\"#infographic/program/TBC-BXB07\" tabindex=\"-999\">Internal Audit Policies and Initiatives</a>",
            "<a href=\"#infographic/program/TBC-BXB04\" tabindex=\"-999\">Management Accountability Framework</a>",
            "<a href=\"#infographic/program/TBC-BXC02\" tabindex=\"-999\">Pension and Benefits Management</a>",
            "<a href=\"#infographic/program/TBC-BXC06\" tabindex=\"-999\">People Management Systems and Processes</a>"
          ]
        }
      },
      "Tested on index-basic-eng.html#infographic/crso/TBC-BXA00/related": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Program - About": {
      "Tested on index-eng.html#infographic/program/TBC-BXC04/intro": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/program/TBC-BXC04/intro": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Program - Finance": {
      "Tested on index-eng.html#infographic/program/TBC-BXC04/financial": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/program/TBC-BXC04/financial": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Program - Services": {
      "Tested on index-eng.html#infographic/program/TBC-BXB03/services": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/program/TBC-BXB03/services": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Program - Results": {
      "Tested on index-eng.html#infographic/program/TBC-BXC04/results": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/program/TBC-BXC04/results": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Program - Where can I go from here?": {
      "Tested on index-eng.html#infographic/program/TBC-BXC04/related": {
        "Axe violations allow list": {
          "color-contrast, serious": [
            "<a href=\"#infographic/program/TBC-BXB03\" tabindex=\"-999\">Digital Strategy, Planning, and Oversight</a>",
            "<a href=\"#infographic/program/TBC-BXB07\" tabindex=\"-999\">Internal Audit Policies and Initiatives</a>",
            "<a href=\"#infographic/program/TBC-BXB04\" tabindex=\"-999\">Management Accountability Framework</a>",
            "<a href=\"#infographic/program/TBC-BXC01\" tabindex=\"-999\">Employee Relations and Total Compensation</a>",
            "<a href=\"#infographic/program/TBC-BXC05\" tabindex=\"-999\">Executive and Leadership Development</a>",
            "<a href=\"#infographic/crso/TBC-ISS00\" tabindex=\"-999\">Internal Services</a>",
            "<a href=\"#infographic/program/TBC-ISS0Z\" tabindex=\"-999\">Acquisition Management Services</a>"
          ]
        }
      },
      "Tested on index-basic-eng.html#infographic/program/TBC-BXC04/related": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Inactive Program - About": {
      "Tested on index-eng.html#infographic/program/PPP-AHZ00/intro": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/program/PPP-AHZ00/intro": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Inactive Program - Finance": {
      "Tested on index-eng.html#infographic/program/PPP-AHZ00/financial": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/program/PPP-AHZ00/financial": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Inactive Program - Where can I go from here?": {
      "Tested on index-eng.html#infographic/program/PPP-AHZ00/related": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/program/PPP-AHZ00/related": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Tag - About": {
      "Tested on index-eng.html#infographic/tag/GOC002/intro": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/tag/GOC002/intro": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Tag - Tagged Programs": {
      "Tested on index-eng.html#infographic/tag/GOC002/structure": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/tag/GOC002/structure": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Tag - Where can I go from here?": {
      "Tested on index-eng.html#infographic/tag/GOC002/related": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/tag/GOC002/related": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Service - Intro": {
      "Tested on index-eng.html#infographic/service/136/intro": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#infographic/service/136/intro": {
        "Axe violations allow list": null
      }
    }
  },
  "__version": "8.7.0"
}
