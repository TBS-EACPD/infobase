const Component = ({subject_context}) => <div>
  This is static panel, it has no initial query, nor does it have the ability to refetch, fetchMore, etc.
  It can still, how ever, make queries internally. It can even use props.subject_context to supply query variables. 

  currently_displayed_level : {subject_context.level}
</div>;


export default {
  //static panels are identified by those having no query property.
  //data_to_props will also be ignored in this case
  levels: ["*"],
  query: null,
  key: "static-panel-example",
  component: Component,
};