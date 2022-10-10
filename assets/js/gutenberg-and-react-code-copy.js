import assign from "lodash.assign";

const { createHigherOrderComponent } = wp.compose;
const { Fragment, useEffect } = wp.element;
const { InspectorControls } = wp.editor;
const { PanelBody, SelectControl } = wp.components;
const { addFilter } = wp.hooks;
const { __ } = wp.i18n;

// Enable spacing control on the following blocks
const enableSpacingControlOnBlocks = ["core/image"];

async function replaceClipboardContent() {
	let text = await navigator.clipboard.readText();
	text = getFirstParagraph(text);
	await navigator.clipboard.writeText(text);
}

function replaceClipboardContentWrapper() {
	replaceClipboardContent()
		.then((_) => {
			return;
		})
		.catch((error) => console.error(error));
}

function getFirstParagraph(text) {
	const firstLine = text.split("\n")[0];
	return firstLine ? firstLine : text;
}

function setPasteEventListener() {
	var gutenbergContainer = document.querySelector(".is-root-container");
	gutenbergContainer.removeEventListener(
		"paste",
		replaceClipboardContentWrapper
	);
	gutenbergContainer.addEventListener(
		"paste",
		replaceClipboardContentWrapper
	);
}

// Available spacing control options
const spacingControlOptions = [
	{
		label: __("None"),
		value: "",
	},
	{
		label: __("Small"),
		value: "small",
	},
	{
		label: __("Medium"),
		value: "medium",
	},
	{
		label: __("Large"),
		value: "large",
	},
];

/**
 * Add spacing control attribute to block.
 *
 * @param {object} settings Current block settings.
 * @param {string} name Name of block.
 *
 * @returns {object} Modified block settings.
 */
const addSpacingControlAttribute = (settings, name) => {
	// Do nothing if it's another block than our defined ones.
	if (!enableSpacingControlOnBlocks.includes(name)) {
		return settings;
	}

	// Use Lodash's assign to gracefully handle if attributes are undefined
	settings.attributes = assign(settings.attributes, {
		spacing: {
			type: "string",
			default: spacingControlOptions[0].value,
		},
	});

	return settings;
};

addFilter(
	"blocks.registerBlockType",
	"extend-block-example/attribute/spacing",
	addSpacingControlAttribute
);

/**
 * Create HOC to add spacing control to inspector controls of block.
 */
const withSpacingControl = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		useEffect(() => {
			setPasteEventListener();
		}, []);

		// Do nothing if it's another block than our defined ones.
		if (!enableSpacingControlOnBlocks.includes(props.name)) {
			return <BlockEdit {...props} />;
		}

		const { spacing } = props.attributes;

		// add has-spacing-xy class to block
		if (spacing) {
			props.attributes.className = `has-spacing-${spacing}`;
		}

		return (
			<Fragment>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						title={__("My Spacing Control")}
						initialOpen={true}
					>
						<SelectControl
							label={__("Spacing")}
							value={spacing}
							options={spacingControlOptions}
							onChange={(selectedSpacingOption) => {
								props.setAttributes({
									spacing: selectedSpacingOption,
								});
							}}
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, "withSpacingControl");

addFilter(
	"editor.BlockEdit",
	"extend-block-example/with-spacing-control",
	withSpacingControl
);

/**
 * Add margin style attribute to save element of block.
 *
 * @param {object} saveElementProps Props of save element.
 * @param {Object} blockType Block type information.
 * @param {Object} attributes Attributes of block.
 *
 * @returns {object} Modified props of save element.
 */
const addSpacingExtraProps = (saveElementProps, blockType, attributes) => {
	// Do nothing if it's another block than our defined ones.
	if (!enableSpacingControlOnBlocks.includes(blockType.name)) {
		return saveElementProps;
	}

	const margins = {
		small: "5px",
		medium: "15px",
		large: "30px",
	};

	if (attributes.spacing in margins) {
		// Use Lodash's assign to gracefully handle if attributes are undefined
		assign(saveElementProps, {
			style: { "margin-bottom": margins[attributes.spacing] },
		});
	}

	return saveElementProps;
};

addFilter(
	"blocks.getSaveContent.extraProps",
	"extend-block-example/get-save-content/extra-props",
	addSpacingExtraProps
);
