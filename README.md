# arch-workflow
Components of the deidentified data request/download/analyze workflow for the ARCH network. Relevant to any i2b2/SHRINE networks.

For further documentation, including setup instructions, see the [wiki](https://github.com/ARCH-commons/arch-workflow/wiki).

## Components currently available:

* _shrine-webclient-arch_: A fork of the 1.22.4 SHRINE webclient with various minor improvements and bugfixes, including:
   * Graph mode is now the default result mode.
   * A bug with undefined numbers was fixed in the query report
   * Query status panel is larger (and made somewhat more user configurable.
   * Login page displays a SmartSheet with network status (ARCH-specific).
   * Beta feature: grey out "find" results in the ontology view that are already contained in folders that appear in results, and sort the results from topmost level down.
* _shrine-webclient-workflow_: A fork of the 1.22.8 SHRINE webclient that has a new tab to build a detailed data request from a query and to flag that query. Also contains the added features of shrine-webclient-arch as of 11/21/2018.
* _webclient-workflow_: The 1.7.09 i2b2 webclient with a plugin installed to pull detailed data requests from SHRINE, generate the detailed data, and either download it or upload it to the ARCH portal (component forthcoming).

Contributors: Stanley Boykin; Jeff Klann, PhD; Nich Wattanasin
