cardmarket-bulk-import
===

This extension allows you to use a CSV file to fill the "List bulk items" option in Cardmarket.

Download it on the [Chrome Webstore](https://chromewebstore.google.com/detail/cardmarket-bulk-import/lbjpmgmfhmgaenclkmfjfompieopaimb) or [Firefox's addons](https://addons.mozilla.org/en-US/firefox/addon/cardmarket-bulk-import/).


![Demo](docs/demo.gif)


## Common questions

### Can I use this extension to import my entire collection at once?
**No! It's not a tool designed to import a CSV of your collection all at once.** This extension's primary focus is to fill the "List bulk items" form in Cardmarket; this means that we're also limited by the usefulness of this form - Cardmarket can only show (and take) up to 100 items at a time, so we would have to import the items in batches of 100 different articles; the extension tries to make this process as seamless as possible, but it can't do more than that.

My recommendation is to split your CSVs by expansion, and then importing each rarity one by one.

### Does this extension support all games available on Cardmarket?
**Yes! Partially!** Currently Magic is the one that supports more properties, but all games support basic importation. More fields planned in the future (PRs welcome!).

### Will this extension handle multiple rows of the same card?
**Yes!** If you have, for example, foil and non foil rows on your CSV, the extension will add them separately.

### Can some rows be wrongfully filled?
**It can happen!** I can't guarantee there are no bugs or issues in some older set tables / names, so it's possible it fails to fill the table correctly. **Always double check the filled form before submitting the cards for sale!** _I take no responsibility for mistakenly made listings._

### Is this extension allowed by Cardmarket themselves?
**Yes!** Although they have not checked / vetted the extension, I have confirmed with support that it was okay for me to publish it and it's okay for users to use.

### Can this extension steal my data?
**No!** Even though the extension is allowed to read and write specifically on websites where the url matches _\*://\*.cardmarket.com/\*/\*/Stock/ListingMethods/BulkListing\*_, the extension **does not read or write over your personal information**. It simply reads and fills the table of bulk listing in order to do it's job!

The entire code is open source and you can verify it here; you can even clone this repository and launch it yourself locally if you don't trust the store version.


## Running it locally as an unpacked extension

If you'd rather run your own build than install from the stores - to try unreleased changes, or just to verify the code yourself - you can load it into Chrome as an unpacked extension.

You'll need [Node.js](https://nodejs.org) and Yarn; the exact versions this project expects are pinned under `engines` in `package.json`. Yarn 4 ships through Corepack, so `corepack enable` is usually all it takes to get the right version.

```bash
git clone https://github.com/ThijmenL98/cardmarket-bulk-import
cd cardmarket-bulk-import
yarn install
yarn build
```

That leaves you a complete extension in `.output/chrome-mv3`. To load it:

1. Open `chrome://extensions` and turn on **Developer mode** (top right).
2. Click **Load unpacked** and select the `.output/chrome-mv3` folder.
3. Open any Cardmarket bulk listing page - the import button is injected into the form.

For Firefox, `yarn build:firefox` writes to `.output/firefox-mv2`, which you can load through `about:debugging` > **This Firefox** > **Load Temporary Add-on** by picking its `manifest.json`.

### While developing

`yarn dev` is nicer than rebuilding by hand: it launches a fresh browser with the extension already loaded and reloads it as you edit. Use `yarn dev:firefox` for Firefox.

If you do use `yarn build`, note that Chrome won't pick up changes on its own - hit the reload icon on the extension's card in `chrome://extensions` after each build. Unpacked extensions also don't auto-update, and Chrome will warn about developer mode extensions on startup; both are expected, and neither applies to the store builds.

`yarn zip` packages the build into `.output/` if you want to move it to another machine. Bear in mind Chrome can't install a zip directly - unpack it first, then load the folder.


## Roadmap & Contributions
I have improvements planned when I find the time to work on them! Check the [TODO](docs/TODO.md) file for the planned upgrades.

I will accept contributions to this project. Open a pull request to the develop branch and I'll review it as soon as I can!
