export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AllDocResultCount = {
  __typename?: 'AllDocResultCount';
  dp21_indicators?: Maybe<Scalars['Int']>;
  dp21_results?: Maybe<Scalars['Int']>;
  dp22_indicators?: Maybe<Scalars['Int']>;
  dp22_results?: Maybe<Scalars['Int']>;
  drr18_indicators_future?: Maybe<Scalars['Int']>;
  drr18_indicators_met?: Maybe<Scalars['Int']>;
  drr18_indicators_not_available?: Maybe<Scalars['Int']>;
  drr18_indicators_not_met?: Maybe<Scalars['Int']>;
  drr18_results?: Maybe<Scalars['Int']>;
  drr19_indicators_future?: Maybe<Scalars['Int']>;
  drr19_indicators_met?: Maybe<Scalars['Int']>;
  drr19_indicators_not_available?: Maybe<Scalars['Int']>;
  drr19_indicators_not_met?: Maybe<Scalars['Int']>;
  drr19_results?: Maybe<Scalars['Int']>;
  drr20_indicators_future?: Maybe<Scalars['Int']>;
  drr20_indicators_met?: Maybe<Scalars['Int']>;
  drr20_indicators_not_available?: Maybe<Scalars['Int']>;
  drr20_indicators_not_met?: Maybe<Scalars['Int']>;
  drr20_results?: Maybe<Scalars['Int']>;
  level?: Maybe<Scalars['String']>;
  subject_id?: Maybe<Scalars['String']>;
};

export type CovidData = {
  __typename?: 'CovidData';
  covid_estimates?: Maybe<Array<Maybe<CovidEstimates>>>;
  covid_expenditures?: Maybe<Array<Maybe<CovidExpenditures>>>;
  fiscal_year?: Maybe<Scalars['Int']>;
};

export type CovidEstimates = {
  __typename?: 'CovidEstimates';
  est_doc?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  org?: Maybe<Org>;
  org_id?: Maybe<Scalars['String']>;
  stat?: Maybe<Scalars['Float']>;
  vote?: Maybe<Scalars['Float']>;
};

export type CovidEstimatesSummary = {
  __typename?: 'CovidEstimatesSummary';
  est_doc?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  stat?: Maybe<Scalars['Float']>;
  vote?: Maybe<Scalars['Float']>;
};

export type CovidExpenditures = {
  __typename?: 'CovidExpenditures';
  id?: Maybe<Scalars['String']>;
  month_last_updated?: Maybe<Scalars['Int']>;
  org?: Maybe<Org>;
  org_id?: Maybe<Scalars['String']>;
  stat?: Maybe<Scalars['Float']>;
  vote?: Maybe<Scalars['Float']>;
};

export type CovidExpendituresSummary = {
  __typename?: 'CovidExpendituresSummary';
  id?: Maybe<Scalars['String']>;
  month_last_updated?: Maybe<Scalars['Int']>;
  stat?: Maybe<Scalars['Float']>;
  vote?: Maybe<Scalars['Float']>;
};

export type CovidGovSummary = {
  __typename?: 'CovidGovSummary';
  covid_estimates?: Maybe<Array<Maybe<CovidEstimatesSummary>>>;
  covid_expenditures?: Maybe<CovidExpendituresSummary>;
  fiscal_year?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['String']>;
  measure_counts?: Maybe<Array<Maybe<CovidSummaryCounts>>>;
  org_counts?: Maybe<Array<Maybe<CovidSummaryCounts>>>;
  top_spending_measures?: Maybe<Array<Maybe<CovidMeasure>>>;
  top_spending_orgs?: Maybe<Array<Maybe<Org>>>;
};


export type CovidGovSummaryTop_Spending_MeasuresArgs = {
  top_x?: InputMaybe<Scalars['Int']>;
};


export type CovidGovSummaryTop_Spending_OrgsArgs = {
  top_x?: InputMaybe<Scalars['Int']>;
};

export type CovidMeasure = {
  __typename?: 'CovidMeasure';
  covid_data?: Maybe<Array<Maybe<CovidData>>>;
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  years_with_covid_data?: Maybe<YearsWithCovidData>;
};


export type CovidMeasureCovid_DataArgs = {
  fiscal_year?: InputMaybe<Scalars['Int']>;
  org_id?: InputMaybe<Scalars['String']>;
};

export type CovidOrgSummary = {
  __typename?: 'CovidOrgSummary';
  covid_estimates?: Maybe<Array<Maybe<CovidEstimatesSummary>>>;
  covid_expenditures?: Maybe<CovidExpendituresSummary>;
  fiscal_year?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['String']>;
};

export type CovidSummaryCounts = {
  __typename?: 'CovidSummaryCounts';
  with_authorities?: Maybe<Scalars['Int']>;
  with_spending?: Maybe<Scalars['Int']>;
};

export type Crso = SubjectI & {
  __typename?: 'Crso';
  description?: Maybe<Scalars['String']>;
  has_results?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['String']>;
  is_active?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  org?: Maybe<Org>;
  programs?: Maybe<Array<Maybe<Program>>>;
  results?: Maybe<Array<Maybe<Result>>>;
  subject_type?: Maybe<Scalars['String']>;
  target_counts?: Maybe<ResultCount>;
};


export type CrsoResultsArgs = {
  doc?: InputMaybe<Scalars['String']>;
};


export type CrsoTarget_CountsArgs = {
  doc?: InputMaybe<Scalars['String']>;
};

export type Gov = {
  __typename?: 'Gov';
  all_target_counts_granular?: Maybe<Array<Maybe<AllDocResultCount>>>;
  all_target_counts_summary?: Maybe<Array<Maybe<AllDocResultCount>>>;
  covid_summary?: Maybe<Array<Maybe<CovidGovSummary>>>;
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  people_data?: Maybe<GovPeopleSummary>;
  service_summary?: Maybe<ServiceSummary>;
  subject_type?: Maybe<Scalars['String']>;
  target_counts?: Maybe<ResultCount>;
  years_with_covid_data?: Maybe<YearsWithCovidData>;
};


export type GovCovid_SummaryArgs = {
  fiscal_year?: InputMaybe<Scalars['Int']>;
};


export type GovTarget_CountsArgs = {
  doc?: InputMaybe<Scalars['String']>;
};

export type GovPeopleSummary = {
  __typename?: 'GovPeopleSummary';
  age_group?: Maybe<Array<Maybe<SummaryHeadcountData>>>;
  average_age?: Maybe<Array<Maybe<YearlyData>>>;
  ex_lvl?: Maybe<Array<Maybe<SummaryHeadcountData>>>;
  fol?: Maybe<Array<Maybe<SummaryHeadcountData>>>;
  gender?: Maybe<Array<Maybe<SummaryHeadcountData>>>;
  id?: Maybe<Scalars['String']>;
  region?: Maybe<Array<Maybe<SummaryHeadcountData>>>;
  type?: Maybe<Array<Maybe<SummaryHeadcountData>>>;
};

export type Indicator = {
  __typename?: 'Indicator';
  actual_result?: Maybe<Scalars['String']>;
  doc?: Maybe<Scalars['String']>;
  gba_plus?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['String']>;
  measure?: Maybe<Scalars['String']>;
  methodology?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  previous_year_actual_result?: Maybe<Scalars['String']>;
  previous_year_gba_plus?: Maybe<Scalars['Boolean']>;
  previous_year_measure?: Maybe<Scalars['String']>;
  previous_year_seeking_to?: Maybe<Scalars['String']>;
  previous_year_target_change?: Maybe<Scalars['String']>;
  previous_year_target_max?: Maybe<Scalars['String']>;
  previous_year_target_min?: Maybe<Scalars['String']>;
  previous_year_target_narrative?: Maybe<Scalars['String']>;
  previous_year_target_type?: Maybe<Scalars['String']>;
  result_explanation?: Maybe<Scalars['String']>;
  result_id?: Maybe<Scalars['String']>;
  seeking_to?: Maybe<Scalars['String']>;
  stable_id?: Maybe<Scalars['String']>;
  status_key?: Maybe<Scalars['String']>;
  target_change?: Maybe<Scalars['String']>;
  target_explanation?: Maybe<Scalars['String']>;
  target_max?: Maybe<Scalars['String']>;
  target_min?: Maybe<Scalars['String']>;
  target_month?: Maybe<Scalars['Int']>;
  target_narrative?: Maybe<Scalars['String']>;
  target_type?: Maybe<Scalars['String']>;
  target_year?: Maybe<Scalars['Int']>;
};

export type InstForm = {
  __typename?: 'InstForm';
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type Minister = {
  __typename?: 'Minister';
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type Ministry = {
  __typename?: 'Ministry';
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  orgs?: Maybe<Array<Maybe<Org>>>;
};

export type Org = SubjectI & {
  __typename?: 'Org';
  acronym?: Maybe<Scalars['String']>;
  applied_title?: Maybe<Scalars['String']>;
  article1_fr?: Maybe<Scalars['String']>;
  article2_fr?: Maybe<Scalars['String']>;
  auditor?: Maybe<Scalars['String']>;
  covid_measures?: Maybe<Array<Maybe<CovidMeasure>>>;
  covid_summary?: Maybe<Array<Maybe<CovidOrgSummary>>>;
  crsos?: Maybe<Array<Maybe<Crso>>>;
  dept_code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  dp_status?: Maybe<Scalars['String']>;
  enabling_instrument?: Maybe<Scalars['String']>;
  end_yr?: Maybe<Scalars['String']>;
  eval_url?: Maybe<Scalars['String']>;
  faa_schedule_hr_status?: Maybe<Scalars['String']>;
  faa_schedule_institutional?: Maybe<Scalars['String']>;
  federal_ownership?: Maybe<Scalars['String']>;
  has_results?: Maybe<Scalars['Boolean']>;
  has_services?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['String']>;
  incorp_yr?: Maybe<Scalars['String']>;
  inst_form?: Maybe<InstForm>;
  legal_title?: Maybe<Scalars['String']>;
  mandate?: Maybe<Scalars['String']>;
  ministers?: Maybe<Array<Maybe<Minister>>>;
  ministry?: Maybe<Ministry>;
  name?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  old_applied_title?: Maybe<Scalars['String']>;
  org_id?: Maybe<Scalars['String']>;
  org_transfer_payments?: Maybe<Array<Maybe<OrgTransferPayments>>>;
  org_vote_stat_estimates?: Maybe<Array<Maybe<OrgVoteStatEstimates>>>;
  org_vote_stat_pa?: Maybe<Array<Maybe<OrgVoteStatPa>>>;
  pas_code?: Maybe<Scalars['String']>;
  people_data?: Maybe<OrgPeopleData>;
  programs?: Maybe<Array<Maybe<Program>>>;
  service_summary?: Maybe<ServiceSummary>;
  services?: Maybe<Array<Maybe<Service>>>;
  subject_type?: Maybe<Scalars['String']>;
  target_counts?: Maybe<ResultCount>;
  website_url?: Maybe<Scalars['String']>;
  years_with_covid_data?: Maybe<YearsWithCovidData>;
};


export type OrgCovid_MeasuresArgs = {
  fiscal_year?: InputMaybe<Scalars['Int']>;
};


export type OrgCovid_SummaryArgs = {
  fiscal_year?: InputMaybe<Scalars['Int']>;
};


export type OrgTarget_CountsArgs = {
  doc?: InputMaybe<Scalars['String']>;
};

export type OrgHeadcountData = {
  __typename?: 'OrgHeadcountData';
  avg_share?: Maybe<Scalars['Float']>;
  dimension?: Maybe<Scalars['String']>;
  yearly_data?: Maybe<Array<Maybe<YearlyData>>>;
};

export type OrgPeopleData = {
  __typename?: 'OrgPeopleData';
  age_group?: Maybe<Array<Maybe<OrgHeadcountData>>>;
  average_age?: Maybe<Array<Maybe<YearlyData>>>;
  ex_lvl?: Maybe<Array<Maybe<OrgHeadcountData>>>;
  fol?: Maybe<Array<Maybe<OrgHeadcountData>>>;
  gender?: Maybe<Array<Maybe<OrgHeadcountData>>>;
  org_id?: Maybe<Scalars['String']>;
  region?: Maybe<Array<Maybe<OrgHeadcountData>>>;
  type?: Maybe<Array<Maybe<OrgHeadcountData>>>;
};

export type OrgTransferPayments = {
  __typename?: 'OrgTransferPayments';
  name?: Maybe<Scalars['String']>;
  pa_last_year_1_auth?: Maybe<Scalars['Float']>;
  pa_last_year_1_exp?: Maybe<Scalars['Float']>;
  pa_last_year_2_auth?: Maybe<Scalars['Float']>;
  pa_last_year_2_exp?: Maybe<Scalars['Float']>;
  pa_last_year_3_auth?: Maybe<Scalars['Float']>;
  pa_last_year_3_exp?: Maybe<Scalars['Float']>;
  pa_last_year_4_auth?: Maybe<Scalars['Float']>;
  pa_last_year_4_exp?: Maybe<Scalars['Float']>;
  pa_last_year_5_auth?: Maybe<Scalars['Float']>;
  pa_last_year_5_exp?: Maybe<Scalars['Float']>;
  type?: Maybe<Scalars['String']>;
};

export type OrgVoteStatEstimates = {
  __typename?: 'OrgVoteStatEstimates';
  doc?: Maybe<Scalars['String']>;
  est_in_year?: Maybe<Scalars['Float']>;
  est_last_year?: Maybe<Scalars['Float']>;
  est_last_year_2?: Maybe<Scalars['Float']>;
  est_last_year_3?: Maybe<Scalars['Float']>;
  est_last_year_4?: Maybe<Scalars['Float']>;
  name?: Maybe<Scalars['String']>;
  vote_num?: Maybe<Scalars['String']>;
  vs_type?: Maybe<Scalars['Float']>;
};

export type OrgVoteStatPa = {
  __typename?: 'OrgVoteStatPa';
  name?: Maybe<Scalars['String']>;
  pa_last_year_2_auth?: Maybe<Scalars['Float']>;
  pa_last_year_2_exp?: Maybe<Scalars['Float']>;
  pa_last_year_2_unlapsed?: Maybe<Scalars['Float']>;
  pa_last_year_3_auth?: Maybe<Scalars['Float']>;
  pa_last_year_3_exp?: Maybe<Scalars['Float']>;
  pa_last_year_3_unlapsed?: Maybe<Scalars['Float']>;
  pa_last_year_4_auth?: Maybe<Scalars['Float']>;
  pa_last_year_4_exp?: Maybe<Scalars['Float']>;
  pa_last_year_4_unlapsed?: Maybe<Scalars['Float']>;
  pa_last_year_5_auth?: Maybe<Scalars['Float']>;
  pa_last_year_5_exp?: Maybe<Scalars['Float']>;
  pa_last_year_5_unlapsed?: Maybe<Scalars['Float']>;
  pa_last_year_auth?: Maybe<Scalars['Float']>;
  pa_last_year_exp?: Maybe<Scalars['Float']>;
  pa_last_year_unlapsed?: Maybe<Scalars['Float']>;
  vote_num?: Maybe<Scalars['String']>;
  vs_type?: Maybe<Scalars['Float']>;
};

export type OrgsOfferingServicesSummary = {
  __typename?: 'OrgsOfferingServicesSummary';
  number_of_services?: Maybe<Scalars['Float']>;
  subject_id?: Maybe<Scalars['String']>;
  total_volume?: Maybe<Scalars['Float']>;
};

export type PidrLink = {
  __typename?: 'PIDRLink';
  program_id?: Maybe<Scalars['String']>;
  result_id?: Maybe<Scalars['String']>;
};

export type Program = SubjectI & {
  __typename?: 'Program';
  activity_code?: Maybe<Scalars['String']>;
  crso?: Maybe<Crso>;
  description?: Maybe<Scalars['String']>;
  drs?: Maybe<Array<Maybe<Result>>>;
  has_results?: Maybe<Scalars['Boolean']>;
  has_services?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['String']>;
  is_active?: Maybe<Scalars['Boolean']>;
  is_internal_service?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  old_name?: Maybe<Scalars['String']>;
  org?: Maybe<Org>;
  pidrlinks?: Maybe<Array<Maybe<PidrLink>>>;
  program_fte?: Maybe<Array<Maybe<ProgramFte>>>;
  program_sobjs?: Maybe<Array<Maybe<ProgramSobjs>>>;
  program_spending?: Maybe<Array<Maybe<ProgramSpending>>>;
  program_vote_stat?: Maybe<Array<Maybe<ProgramVoteStat>>>;
  results?: Maybe<Array<Maybe<Result>>>;
  service_summary?: Maybe<ServiceSummary>;
  services?: Maybe<Array<Maybe<Service>>>;
  subject_type?: Maybe<Scalars['String']>;
  target_counts?: Maybe<ResultCount>;
};


export type ProgramResultsArgs = {
  doc?: InputMaybe<Scalars['String']>;
};


export type ProgramTarget_CountsArgs = {
  doc?: InputMaybe<Scalars['String']>;
};

export type ProgramFte = {
  __typename?: 'ProgramFte';
  pa_last_year?: Maybe<Scalars['Float']>;
  pa_last_year_2?: Maybe<Scalars['Float']>;
  pa_last_year_3?: Maybe<Scalars['Float']>;
  pa_last_year_4?: Maybe<Scalars['Float']>;
  pa_last_year_5?: Maybe<Scalars['Float']>;
  pa_last_year_planned?: Maybe<Scalars['Float']>;
  planning_year_1?: Maybe<Scalars['Float']>;
  planning_year_2?: Maybe<Scalars['Float']>;
  planning_year_3?: Maybe<Scalars['Float']>;
};

export type ProgramSobjs = {
  __typename?: 'ProgramSobjs';
  pa_last_year?: Maybe<Scalars['Float']>;
  pa_last_year_2?: Maybe<Scalars['Float']>;
  pa_last_year_3?: Maybe<Scalars['Float']>;
  so_num?: Maybe<Scalars['Float']>;
};

export type ProgramSpending = {
  __typename?: 'ProgramSpending';
  pa_last_year_2_exp?: Maybe<Scalars['Float']>;
  pa_last_year_3_exp?: Maybe<Scalars['Float']>;
  pa_last_year_4_exp?: Maybe<Scalars['Float']>;
  pa_last_year_5_exp?: Maybe<Scalars['Float']>;
  pa_last_year_exp?: Maybe<Scalars['Float']>;
  pa_last_year_planned?: Maybe<Scalars['Float']>;
  planning_year_1?: Maybe<Scalars['Float']>;
  planning_year_2?: Maybe<Scalars['Float']>;
  planning_year_3?: Maybe<Scalars['Float']>;
};

export type ProgramVoteStat = {
  __typename?: 'ProgramVoteStat';
  pa_last_year?: Maybe<Scalars['Float']>;
  pa_last_year_2?: Maybe<Scalars['Float']>;
  pa_last_year_3?: Maybe<Scalars['Float']>;
  vs_type?: Maybe<Scalars['String']>;
};

export enum PublicAccountsYear {
  PaLastYear = 'pa_last_year',
  PaLastYear_2 = 'pa_last_year_2',
  PaLastYear_3 = 'pa_last_year_3',
  PaLastYear_4 = 'pa_last_year_4',
  PaLastYear_5 = 'pa_last_year_5'
}

export type Query = {
  __typename?: 'Query';
  root: Root;
};


export type QueryRootArgs = {
  lang: Scalars['String'];
};

export type Result = {
  __typename?: 'Result';
  doc?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  indicators?: Maybe<Array<Maybe<Indicator>>>;
  name?: Maybe<Scalars['String']>;
  parent_id?: Maybe<Scalars['String']>;
  stable_id?: Maybe<Scalars['String']>;
};


export type ResultIndicatorsArgs = {
  doc?: InputMaybe<Scalars['String']>;
};

export type ResultCount = {
  __typename?: 'ResultCount';
  doc?: Maybe<Scalars['String']>;
  indicators_dp?: Maybe<Scalars['Int']>;
  indicators_future?: Maybe<Scalars['Int']>;
  indicators_met?: Maybe<Scalars['Int']>;
  indicators_not_available?: Maybe<Scalars['Int']>;
  indicators_not_met?: Maybe<Scalars['Int']>;
  results?: Maybe<Scalars['Int']>;
};

export type Root = {
  __typename?: 'Root';
  all_orgs?: Maybe<Array<Maybe<Org>>>;
  covid_measure?: Maybe<CovidMeasure>;
  covid_measures?: Maybe<Array<Maybe<CovidMeasure>>>;
  crso?: Maybe<Crso>;
  crso_search?: Maybe<Array<Maybe<Crso>>>;
  gov?: Maybe<Gov>;
  indicator?: Maybe<Indicator>;
  non_field?: Maybe<Scalars['String']>;
  org?: Maybe<Org>;
  org_search?: Maybe<Array<Maybe<Org>>>;
  orgs?: Maybe<Array<Maybe<Org>>>;
  program?: Maybe<Program>;
  program_search?: Maybe<Array<Maybe<Program>>>;
  search_services?: Maybe<Array<Maybe<Service>>>;
  service?: Maybe<Service>;
  subject?: Maybe<SubjectI>;
  subject_search_interfaces?: Maybe<Array<Maybe<SubjectI>>>;
  subject_search_union?: Maybe<Array<Maybe<SubjectU>>>;
};


export type RootCovid_MeasureArgs = {
  covid_measure_id: Scalars['String'];
};


export type RootCovid_MeasuresArgs = {
  fiscal_year?: InputMaybe<Scalars['Int']>;
};


export type RootCrsoArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type RootCrso_SearchArgs = {
  query: Scalars['String'];
};


export type RootIndicatorArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type RootOrgArgs = {
  dept_code?: InputMaybe<Scalars['String']>;
  org_id?: InputMaybe<Scalars['String']>;
};


export type RootOrg_SearchArgs = {
  query: Scalars['String'];
};


export type RootProgramArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type RootProgram_SearchArgs = {
  query: Scalars['String'];
};


export type RootSearch_ServicesArgs = {
  search_phrase: Scalars['String'];
};


export type RootServiceArgs = {
  id: Scalars['String'];
};


export type RootSubjectArgs = {
  id: Scalars['String'];
  subject_type: SubjectType;
};


export type RootSubject_Search_InterfacesArgs = {
  query: Scalars['String'];
};


export type RootSubject_Search_UnionArgs = {
  query: Scalars['String'];
};

export type Service = {
  __typename?: 'Service';
  accessibility_assessors?: Maybe<Array<Maybe<Scalars['String']>>>;
  account_reg_digital_status?: Maybe<Scalars['Boolean']>;
  application_digital_status?: Maybe<Scalars['Boolean']>;
  authentication_status?: Maybe<Scalars['Boolean']>;
  collects_fees?: Maybe<Scalars['Boolean']>;
  decision_digital_status?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  designations?: Maybe<Array<Maybe<Scalars['String']>>>;
  digital_enablement_comment?: Maybe<Scalars['String']>;
  digital_identity_platforms?: Maybe<Array<Maybe<Scalars['String']>>>;
  feedback_channels?: Maybe<Array<Maybe<Scalars['String']>>>;
  first_active_year?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  is_active?: Maybe<Scalars['Boolean']>;
  issuance_digital_status?: Maybe<Scalars['Boolean']>;
  issue_res_digital_status?: Maybe<Scalars['Boolean']>;
  last_accessibility_review?: Maybe<Scalars['String']>;
  last_active_year?: Maybe<Scalars['String']>;
  last_gender_analysis?: Maybe<Scalars['String']>;
  last_improve_from_feedback?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  org?: Maybe<Org>;
  org_id?: Maybe<Scalars['String']>;
  program_activity_codes?: Maybe<Array<Maybe<Scalars['String']>>>;
  programs?: Maybe<Array<Maybe<Program>>>;
  recipient_type?: Maybe<Array<Maybe<Scalars['String']>>>;
  report_years?: Maybe<Array<Maybe<Scalars['String']>>>;
  scope?: Maybe<Array<Maybe<Scalars['String']>>>;
  service_report?: Maybe<Array<Maybe<ServiceReport>>>;
  service_type?: Maybe<Array<Maybe<Scalars['String']>>>;
  standards?: Maybe<Array<Maybe<ServiceStandard>>>;
  subject_type?: Maybe<Scalars['String']>;
  submission_year?: Maybe<Scalars['String']>;
  target_groups?: Maybe<Array<Maybe<Scalars['String']>>>;
  urls?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ServiceChannelsSummary = {
  __typename?: 'ServiceChannelsSummary';
  channel_id?: Maybe<Scalars['String']>;
  channel_value?: Maybe<Scalars['Float']>;
  subject_id?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
};

export type ServiceDigitalStatusSummary = {
  __typename?: 'ServiceDigitalStatusSummary';
  can_online?: Maybe<Scalars['Float']>;
  cannot_online?: Maybe<Scalars['Float']>;
  key?: Maybe<Scalars['String']>;
  key_desc?: Maybe<Scalars['String']>;
  not_applicable?: Maybe<Scalars['Float']>;
  subject_id?: Maybe<Scalars['String']>;
};

export type ServiceGeneralStats = {
  __typename?: 'ServiceGeneralStats';
  num_of_programs_offering_services?: Maybe<Scalars['Float']>;
  num_of_subject_offering_services?: Maybe<Scalars['Float']>;
  number_of_online_enabled_services?: Maybe<Scalars['Float']>;
  number_of_services?: Maybe<Scalars['Float']>;
  pct_of_online_client_interaction_pts?: Maybe<Scalars['Float']>;
  pct_of_standards_met_high_vol_services?: Maybe<Scalars['Float']>;
  report_years?: Maybe<Array<Maybe<Scalars['String']>>>;
  standard_years?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ServiceReport = {
  __typename?: 'ServiceReport';
  cra_business_ids_collected?: Maybe<Scalars['Boolean']>;
  email_application_count?: Maybe<Scalars['Float']>;
  fax_application_count?: Maybe<Scalars['Float']>;
  live_application_count?: Maybe<Scalars['Float']>;
  mail_application_count?: Maybe<Scalars['Float']>;
  online_application_count?: Maybe<Scalars['Float']>;
  online_inquiry_count?: Maybe<Scalars['Float']>;
  other_application_count?: Maybe<Scalars['Float']>;
  phone_application_count?: Maybe<Scalars['Float']>;
  phone_inquiry_and_application_count?: Maybe<Scalars['Float']>;
  phone_inquiry_count?: Maybe<Scalars['Float']>;
  service_id?: Maybe<Scalars['String']>;
  service_report_comment?: Maybe<Scalars['String']>;
  sin_collected?: Maybe<Scalars['Boolean']>;
  year?: Maybe<Scalars['String']>;
};

export type ServiceStandard = {
  __typename?: 'ServiceStandard';
  channel?: Maybe<Scalars['String']>;
  first_active_year?: Maybe<Scalars['String']>;
  last_active_year?: Maybe<Scalars['String']>;
  last_gcss_tool_year?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  other_type_comment?: Maybe<Scalars['String']>;
  rtp_urls?: Maybe<Array<Maybe<Scalars['String']>>>;
  service_id?: Maybe<Scalars['String']>;
  standard_id?: Maybe<Scalars['String']>;
  standard_report?: Maybe<Array<Maybe<StandardReport>>>;
  standard_urls?: Maybe<Array<Maybe<Scalars['String']>>>;
  submission_year?: Maybe<Scalars['String']>;
  target_type?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type ServiceStandardsSummary = {
  __typename?: 'ServiceStandardsSummary';
  met_standards_count?: Maybe<Scalars['Float']>;
  services_w_standards_count?: Maybe<Scalars['Float']>;
  standards_count?: Maybe<Scalars['Float']>;
  subject_id?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
};

export type ServiceSummary = {
  __typename?: 'ServiceSummary';
  id?: Maybe<Scalars['String']>;
  service_channels_summary?: Maybe<Array<Maybe<ServiceChannelsSummary>>>;
  service_digital_status_summary?: Maybe<Array<Maybe<ServiceDigitalStatusSummary>>>;
  service_general_stats?: Maybe<ServiceGeneralStats>;
  service_standards_summary?: Maybe<Array<Maybe<ServiceStandardsSummary>>>;
  subject_offering_services_summary?: Maybe<Array<Maybe<OrgsOfferingServicesSummary>>>;
};

export type StandardReport = {
  __typename?: 'StandardReport';
  count?: Maybe<Scalars['Float']>;
  is_target_met?: Maybe<Scalars['Boolean']>;
  lower?: Maybe<Scalars['Float']>;
  met_count?: Maybe<Scalars['Float']>;
  standard_id?: Maybe<Scalars['String']>;
  standard_report_comment?: Maybe<Scalars['String']>;
  upper?: Maybe<Scalars['Float']>;
  year?: Maybe<Scalars['String']>;
};

export type SubjectI = {
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  subject_type?: Maybe<Scalars['String']>;
};

export enum SubjectType {
  Crso = 'crso',
  Gov = 'gov',
  Org = 'org',
  Program = 'program'
}

export type SubjectU = Crso | Org | Program;

export type SummaryHeadcountData = {
  __typename?: 'SummaryHeadcountData';
  dimension?: Maybe<Scalars['String']>;
  yearly_data?: Maybe<Array<Maybe<YearlyData>>>;
};

export type YearlyData = {
  __typename?: 'YearlyData';
  value?: Maybe<Scalars['Float']>;
  year?: Maybe<Scalars['Int']>;
};

export type YearsWithCovidData = {
  __typename?: 'YearsWithCovidData';
  years_with_estimates?: Maybe<Array<Maybe<Scalars['Int']>>>;
  years_with_expenditures?: Maybe<Array<Maybe<Scalars['Int']>>>;
};
