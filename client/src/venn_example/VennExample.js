import { useState, useEffect } from "react";
import { StandardRouteContainer } from "../core/NavComponents.js";
import { VennDiagram } from "../charts/VennDiagram.js";
import { Dept } from "../models/organizational_entities";
import { TrinityItem } from "../components/index.js";
import { random } from "lodash";

const example_data = [
  { sets: ["A"], size: 12 },
  { sets: ["B"], size: 15 },
  { sets: ["C"], size: 6 },
  { sets: ["A", "B"], size: 3 },
  { sets: ["A", "C"], size: 2 },
  { sets: ["A", "B", "C"], size: 2 },
  { sets: ["B", "C"], size: 2 },
];

function randomBool(prob) {
  return _.random(true) < prob;
}

const getAllSubsets = (list) =>
  list.reduce(
    (subsets, value) => subsets.concat(subsets.map((set) => [value, ...set])),
    [[]]
  );

//service data

function generateService() {
  const external = randomBool(0.899427116);
  const internal = randomBool(0.096117123);
  return {
    // internal: randomBool(0.5),
    // external: randomBool(0.5),
    // int_entreprise: randomBool(0.5),
    internal,
    external,
    int_entreprise: external
      ? internal
        ? randomBool(0.05)
        : randomBool(0.025)
      : internal
      ? randomBool(0.25)
      : randomBool(0.05),

    // int_entreprise: randomBool(0.031826862),
    // internal: randomBool(0.5),
    // external: randomBool(0.7),
    // int_entreprise: randomBool(0.3),
    // d: randomBool(),
    // e: randomBool(),
    // f: randomBool(),
  };
}

function generateRandomServiceData() {
  const services = _.range(1, 1250).map(generateService);
  const counts_by_subset = {};
  _.each(services, (s) => {
    const groups = Object.keys(_.pickBy(s));
    const group_combinations = getAllSubsets(groups).filter(
      (g) => !_.isEmpty(g)
    );
    _.each(group_combinations, (sub_group) => {
      const set_key = sub_group.join(",");

      let current_val = counts_by_subset[set_key];

      if (current_val == undefined) {
        current_val = 0;
      }
      counts_by_subset[set_key] = current_val + 1;
    });
  });

  const final_result = _.map(counts_by_subset, (val, key) => ({
    sets: key.split(","),
    size: val,
  }));
  return final_result;
}

// end service data

// igoc related data

function getGroupsForOrg(org) {
  const obj = {
    // [org.pop_group_parent_key]: true,
    has_data: !_.isEmpty(org.table_ids),
    [org.inst_form.parent_form.id]: true,
  };
  if (org.pop_group_parent_key) {
    obj[org.pop_group_parent_key] = true;
  }
  return obj;
}

function getOtherGroupsForOrg(org) {
  const has_people = _.includes(org.tables, "orgEmployeeType");
  const has_financials = _.includes(org.tables, "programSpending");
  const has_results = has_financials && randomBool(0.6);

  return {
    has_people,
    has_financials,
    has_results,
    // has_no_data: !(has_people || has_financials || has_results),
    universe: true,
  };
}

function generateOrgData() {
  const orgs = _.chain(Dept.get_all())
    .reject("is_dead")
    // .filter("pop_group_parent_key")
    .filter("inst_form")
    .map(getOtherGroupsForOrg)
    .value();
  const counts_by_subset = {};
  _.each(orgs, (s) => {
    const groups = Object.keys(_.pickBy(s));
    const group_combinations = getAllSubsets(groups).filter(
      (g) => !_.isEmpty(g)
    );
    _.each(group_combinations, (sub_group) => {
      const set_key = sub_group.join(",");

      let current_val = counts_by_subset[set_key];

      if (current_val == undefined) {
        current_val = 0;
      }
      counts_by_subset[set_key] = current_val + 1;
    });
  });

  const final_result = _.map(counts_by_subset, (val, key) => ({
    sets: key.split(","),
    size: val,
  }));

  //other group fixes
  const universe_group = _.find(
    final_result,
    // (d) => d.sets.length == 1 && d.sets[0] == "has_data"
    (d) => d.sets.length == 1 && d.sets[0] == "universe"
  );
  const has_financials = _.find(
    final_result,
    // (d) => d.sets.length == 1 && d.sets[0] == "has_data"
    (d) => d.sets.length == 2 && _.includes(d.sets, "has_financials")
  );

  //the algorithm favors accuracy of proportions over inclusions. When fits are too tight, it will
  //we can mitigate this a little bit by making the containing groups larger, giving the children more space
  has_financials.size = has_financials.size * 1.6;
  universe_group.size = universe_group.size * 1.4;

  return final_result;
}

export default class VennExample extends React.Component {
  render() {
    return (
      <StandardRouteContainer
        title={"playground"}
        breadcrumbs={[]}
        description={""}
        route_key="_playground"
      >
        <div
          style={{ margin: "20px", border: "1px solid black", padding: "20px" }}
        >
          <ChartContainer />
        </div>
      </StandardRouteContainer>
    );
  }
}

const og_data = generateRandomServiceData();
window.data = og_data;

function labelFormater(d) {
  return {
    internal: "Internal",
    external: "External",
    int_entreprise: "Internal Entreprise",
  }[d.sets[0]];
}

function tooltipFormater(d) {
  return `${d.sets.join(", ")} : ${d.size}`;
}

function ChartContainer() {
  const [dataState, setData] = useState(og_data);

  const org_data = generateOrgData();

  function setASize(num) {
    setData([
      { sets: ["A"], size: num },
      ..._.reject(dataState, (x) => _.isEqual(x.sets, ["A"])),
    ]);
  }

  // const a_size = _.find(dataState, (x) => _.isEqual(x.sets, ["A"])).size;

  return (
    <div style={{ margin: "20px" }}>
      <div>
        <label>
          A
          <input
            type="number"
            value={0}
            onChange={(e) => setASize(e.target.value)}
          />
        </label>
      </div>
      <div
        style={{ margin: "20px", border: "1px solid black", padding: "20px" }}
      >
        <VennDiagram
          data={og_data}
          label_formater={labelFormater}
          tooltipFormater={tooltipFormater}
        />
      </div>
      <div
        style={{ margin: "20px", border: "1px solid black", padding: "20px" }}
      >
        <VennDiagram
          data={org_data}
          label_formater={(s) => s.sets[0]}
          tooltipFormater={(s) => `${s.sets.join(", ")} : ${s.size}`}
        />
      </div>
    </div>
  );
}
