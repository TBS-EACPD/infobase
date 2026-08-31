// TODO report configs should encapsulate report metadata, loading promise, and code for converting the raw data to some standardized
// format that the ReportBuilder component can feed in to a DisplayTable with it's state mirrored to the URL
// In other words, strip a bunch of responsibilities out of the existing Table code and drop it here (with a cleaner API that's agnostic about
// where and how data is loaded/cached)
// Hmm, well, some metadata, like relevant footnote topic keys etc, might need to stay soured from the corresponding Table classes, since ripping
// that integration out of the panel inventory should be out of scope (to double check, but I think the panel inventory pulls topics from required
// Table classes). Play that all by ear, but try not to let this become an even more bloated PR than it's inevitably going to be!
