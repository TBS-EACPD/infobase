import mongoose from "mongoose";

const model_singleton = {

  properties: {}, //just a random namespace for random things
  define_property(key, val){
    this.properties[key] = val;
  },

  models: {},
  define_model(name, mongoose_schema){
    this.models[name] = mongoose.model(name, mongoose_schema);
  },

  loaders: {},
  define_loader(name, loader){
    this.loaders[name] = loader;
  },
  services:{},
  define_service(name,service){
    this.services[name] = service;
  },
};

export default model_singleton;