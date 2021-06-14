The goal of this document is to establish principles that we can use in our decision making around the list of organizations to include in the InfoBase going forward. It will always be an individual decision each time we integrate a new dataset; the point of this exercise is not to establish ironclad "rules" that must be followed. This will feed into and be fed from our decisions about what new datasets to include in the InfoBase.

### Definitions

By "universe", we are talking about the list of organizations that make up the government and how they are related. For example, OCHRO counts the statistical survey operators as a separate group distinct from Statistics Canada, while from the financial standpoint there they are paid out of the same amounts.

### Background

The InfoBase started out as the Expenditure Management Database, so it was natural that the focus and the perspective was through the financial lens first and foremost. The addition of the people management data was the first big inclusion of data from a source working in a different "universe", but Results data added another case (that of the Offices of the Privacy and Information Commissioners) and it is presumed that new datasets will each have their own quirks.

One important consideration is the existence of the IGOC as the official inventory of government organizations. Considering this, we have a responsibility to ensure that the organizations we include in the IGOC are what we want to exist as an official list of organizations.

### Current status

Up until now, the decisions about how to handle differences in universes have been inconsistent. For example, InfoBase includes Statistical Survey Operations as a separate organization in the IGOC, but does not include separate people management data for this organization (including the PAS code). In contrast, the Offices of the Privacy and Information Commissioners is a single organization with both website URLs and PAS codes (which has generated a small display bug on the About tombstone for this organization). The results data for these two organizations has been merged. Federal Judges is included in the IGOC despite not being an organization (in anyone's eyes, even OCHRO).

### Motivation for change

While the gravitational centre of the InfoBase will likely always be financial data, we are increasingly including data from other areas that TBS has oversight over, and certainly may include data from other departments in the future. As other areas have different lenses on what constitutes government organizations, it behooves us to have some flexibility in regards to what we consider an organization. This will a) allow us to include more data in the InfoBase, and b) reduce some of the friction in including these data.

### Principles

1. A set of organizations should _generally_ correspond to the organizations the InfoBase already includes, to departments as they are generally conceived. Exceptions should be just that--exceptions.
1. We should endeavour to include only organizations in the InfoBase, meaning structures within the public service that are made up of employees, spending, or activities under a reporting structure (If we can't identify who's in charge, is it really an organization?). Ad-hoc groupings set up for the purposes of reporting (like judges) should be avoided.
1. It is possible that we won't always be able to avoid adding fictitious entities to the InfoBase Universe for reporting purposes, but we should not always include them in the IGOC sub-app or open dataset. For instance, "Federal Judges Not Part of Any Department" has no standing as a real organization, it's just an OCHRO reporting artifact, so we should probably be filtering it from the IGOC for display purposes.
1. If the financial data is splittable between the organizations, or if multiple other datasets can be split to match the incoming data, then the split should be made.
1. If the impact of including new organizations will be small relative to the potential positive impact (e.g. the ability to incorporate a new dataset completely, with the associated benefits (the ability to make government-wide statements) of that completeness) then they should be added.
1. Incoming datasets should not result in merges of organizations.
1. Footnotes should be added to the new or unusual organizations as well as the organizations it is linked to explaining what data could be missing and where to find it.
