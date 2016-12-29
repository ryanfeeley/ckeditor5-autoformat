/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module autoformat/autoformat
 */

import BlockAutoformatEngine from './blockautoformatengine';
import InlineAutoformatEngine from './inlineautoformatengine';
import Plugin from 'ckeditor5-core/src/plugin';
import HeadingEngine from 'ckeditor5-heading/src/headingengine';
import ListEngine from 'ckeditor5-list/src/listengine';
import BoldEngine from 'ckeditor5-basic-styles/src/boldengine';
import ItalicEngine from 'ckeditor5-basic-styles/src/italicengine';

/**
 * Includes a set of predefined autoformatting actions.
 *
 * ## Bulleted list
 *
 * You can create a bulleted list by staring a line with:
 *
 * * `* `
 * * `- `
 *
 * ## Numbered list
 *
 * You can create a numbered list by staring a line with:
 *
 * * `1. `
 * * `1) `
 *
 * ## Headings
 *
 * You can create a heading by starting a line with:
 *
 * `# ` – will create Heading 1,
 * `## ` – will create Heading 2,
 * `### ` – will create Heading 3.
 *
 * ## Bold and italic
 *
 * You can apply bold or italic to a text by typing Markdown formatting:
 *
 * * `**foo bar**` or `__foo bar__` – will bold the text,
 * * `*foo bar*` or `_foo bar_` – will italicize the text,
 *
 * @extends module:core/plugin~Plugin
 */
export default class Autoformat extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HeadingEngine, ListEngine, BoldEngine, ItalicEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._addListAutoformats();
		this._addHeadingAutoformats();
		this._addInlineAutoformats();
	}

	/**
	 * Adds autoformatting related to ListEngine commands.
	 *
	 * When typed:
	 * - `* ` or `- ` - paragraph will be changed to a bulleted list,
	 * - `1. ` or `1) ` - paragraph will be changed to a numbered list (1 can be any digit or list of digits).
	 *
	 * @private
	 */
	_addListAutoformats() {
		new BlockAutoformatEngine( this.editor, /^[\*\-]\s$/, 'bulletedList' );
		new BlockAutoformatEngine( this.editor, /^\d+[\.|)]?\s$/, 'numberedList' );
	}

	/**
	 * Adds autoformatting related to HeadingEngine commands.
	 * When typed `# ` or `## ` or `### ` paragraph will be changed to a corresponding heading level.
	 *
	 * @private
	 */
	_addHeadingAutoformats() {
		new BlockAutoformatEngine( this.editor, /^(#{1,3})\s$/, ( context ) => {
			const { batch, match } = context;
			const headingLevel = match[ 1 ].length;

			this.editor.execute( 'heading', {
				batch,
				formatId: `heading${ headingLevel }`
			} );
		} );
	}

	/**
	 * Adds inline autoformatting capabilities to the editor.
	 *
	 * When typed:
	 * - `**foobar**`: `**` characters are removed, and `foobar` is set to bold,
	 * - `__foobar__`: `__` characters are removed, and `foobar` is set to bold,
	 * - `*foobar*`: `*` characters are removed, and `foobar` is set to italic,
	 * - `_foobar_`: `_` characters are removed, and `foobar` is set to italic.
	 *
	 * @private
	 */
	_addInlineAutoformats() {
		new InlineAutoformatEngine( this.editor, /(\*\*)([^\*]+)(\*\*)$/g, 'bold' );
		new InlineAutoformatEngine( this.editor, /(__)([^_]+)(__)$/g, 'bold' );

		// The italic autoformatter cannot be triggered by the bold markers, so we need to check the
		// text before the pattern (e.g. `(?:^|[^\*])`).
		new InlineAutoformatEngine( this.editor, /(?:^|[^\*])(\*)([^\*_]+)(\*)$/g, 'italic' );
		new InlineAutoformatEngine( this.editor, /(?:^|[^_])(_)([^_]+)(_)$/g, 'italic' );
	}
}
