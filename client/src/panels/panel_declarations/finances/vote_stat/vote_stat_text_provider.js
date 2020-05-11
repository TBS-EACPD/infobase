import { create_text_maker_component } from "../../shared.js";
import text from "./vote_stat_text.yaml";

export const { text_maker, TM } = create_text_maker_component([text]);
