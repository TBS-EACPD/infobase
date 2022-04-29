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
          //Seems to be an issue with hidden visibility
          "color-contrast, serious": [
            "<button class=\"btn btn-ib-primary floating-button floating-button--fixed\" aria-label=\"Back to top\" style=\"top: auto;\">Back to top</button>"
          ]
        }
      },
      "Tested on index-basic-eng.html#glossary": {
        "Axe violations allow list": {
          //Seems to be an issue with hidden visibility
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
    "Treemap Explorer": {
      "Tested on index-eng.html#treemap": {
        "Axe violations allow list": null
      }
    },
    "Indicator text comparison - TBS": {
      "Tested on index-eng.html#diff/326": {
        "Axe violations allow list": null
      },
      "Tested on index-basic-eng.html#diff/326": {
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
            // TODO intersects with tall height clipped table, false positives. The related table should use pagination instead of a height clipper
            "<span>Data sources</span>",
            "<span>Service Inventory</span>",
            "<span>Datasets</span>",
            "<span>Service Inventory</span>",
            "<span>Applications by telephone</span>",
            "<span class=\"infobase-pie__legend-data\">1,327,740</span>",
            "<span class=\"text-nowrap\">0.4%</span>",
            "<strong>2019-20</strong>",
            "<strong>Government of Canada</strong>",
            "<p>"
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
            // TODO intersects with tall height clipped table, false positives. The related table should use pagination instead of a height clipper
            "<span>Departmental Results Reports</span>",
            "<span>Performance information (results and indicators) by Program and by Organization</span>",
            "<span>Departmental Plans</span>",
            "<span>Planned performance information (results and indicators) by Program and by Organization</span>"
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
        "Axe violations allow list": {
          "color-contrast, serious": [
            // TODO intersects with tall height clipped table, false positives. The related table should use pagination instead of a height clipper
            "<span>Data sources</span>",
            "<span>Service Inventory</span>",
            "<span>Datasets</span>",
            "<span>Service Inventory</span>"
          ]
        }
      },
      "Tested on index-basic-eng.html#infographic/dept/326/services": {
        "Axe violations allow list": null
      }
    },
    "Infographic - Dept - Results": {
      "Tested on index-eng.html#infographic/dept/326/results": {
        "Axe violations allow list": {
          "color-contrast, serious": [
            // TODO intersects with tall height clipped table, false positives. The related table should use pagination instead of a height clipper
            "<span>Departmental Results Reports</span>",
            "<span>Performance information (results and indicators) by Program and by Organization</span>"
          ]
        }
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
        "Axe violations allow list": {
          "color-contrast, serious": [
            // TODO intersects with tall height clipped table, false positives. The related table should use pagination instead of a height clipper
            "<span>Departmental Results Reports</span>",
            "<span>Performance information (results and indicators) by Program and by Organization</span>"
          ]
        }
      },
      "Tested on index-basic-eng.html#infographic/crso/TBC-BXA00/results": {
        "Axe violations allow list": null
      }
    },
    "Infographic - CRSO - Where can I go from here?": {
      "Tested on index-eng.html#infographic/crso/TBC-BXA00/related": {
        "Axe violations allow list": null
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
        "Axe violations allow list": null
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
  "__version": "8.6.0"
}