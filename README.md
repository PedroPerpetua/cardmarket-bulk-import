cardmarket-bulk-import
===

This extension allows you to use a CSV file to fill the "List bulk items" option in Cardmarket.

Download it on the [Chrome Webstore](https://chromewebstore.google.com/detail/cardmarket-bulk-import/lbjpmgmfhmgaenclkmfjfompieopaimb) or [Firefox's addons](https://addons.mozilla.org/en-US/firefox/addon/cardmarket-bulk-import/).


![Demo](docs/demo.gif)


## Common questions

### Does this extension support all games available on Cardmarket?
Yes. Currently Magic is the one that supports more properties, but all games support basic importation. More fields planned in the future (PRs welcome!).

### Will this extension handle multiple rows of the same card?
**Yes!** If you have, for example, foil and non foil rows on your CSV, the extension will add them separately.

### Can some rows be wrongfully filled?
**It can happen!** I can't guarantee there are no bugs or issues in some older set tables / names, so it's possible it fails to fill the table correctly. **Always double check the filled form before submitting the cards for sale!** _I take no responsibility for mistakenly made listings._

### Is this extension allowed by Cardmarket themselves?
**Yes!** Although they have not checked / vetted the extension, I have confirmed with support that it was okay for me to publish it and it's okay for users to use.

### Can this extension steal my data?
Even though the extension is allowed to read and write specifically on websites where the url matches _\*://\*.cardmarket.com/\*/Magic/Stock/ListingMethods/BulkListing\*_, the extension **does not read or write over your personal information**. It simply reads and fills the table of bulk listing in order to do it's job!

The entire code is open source and you can verify it here; you can even clone this repository and launch it yourself locally if you don't trust the store version.


## Roadmap & Contributions
I have improvements planned when I find the time to work on them! Check the [TODO](docs/TODO.md) file for the planned upgrades.

I will accept contributions to this project. Open a pull request to the develop branch and I'll review it as soon as I can!
