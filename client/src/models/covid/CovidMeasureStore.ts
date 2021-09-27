import { make_store } from "src/models/utils/make_store";

type CovidMeasureDef = {
  id: string;
  name: string;
};

export const CovidMeasureStore = make_store((def: CovidMeasureDef) => def);
