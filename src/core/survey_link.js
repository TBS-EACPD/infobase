import survey_text_bundle from "../core/survey_link.yaml";
import { create_text_maker } from '../models/text.js';

const home_tm = create_text_maker(survey_text_bundle);
