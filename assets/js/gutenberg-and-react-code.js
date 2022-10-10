const { createHigherOrderComponent } = wp.compose;
const { useEffect } = wp.element;
const { addFilter } = wp.hooks;
// const { getBlocks } = wp.data.select("core/block-editor");

// let blockList = getBlocks();

// wp.data.subscribe(() => {
// 	const newBlockList = getBlocks();
// 	const isBlockAdded = newBlockList.length > blockList.length;

// 	if (!isBlockAdded) return;

// 	const addedBlocks = newBlockList.filter((x) => !blockList.includes(x));
// 	blockList = newBlockList;

// 	addedBlocks.map((blockItem) => {
// 		const clientId = blockItem.clientId;

// 		setTimeout(function () {
// 			const elem = document.querySelector(`[data-block="${clientId}"]`);

// 			elem.addEventListener("paste", pasteOneTextLineEventHandler);

// 			elem.addEventListener("drop", dropOneTextLineEventHandler);
// 		}, 100);
// 	});
// });

async function replaceClipboardContent() {
	let text = await navigator.clipboard.readText();
	text = getFirstParagraph(text);
	await navigator.clipboard.writeText(text);
}

function dropOneTextLineEventHandler(e) {
	e.preventDefault();
	let text = e.dataTransfer.getData("text/plain");
	e.targe.innerText = getFirstParagraph(text);
}

function pasteOneTextLineEventHandler(e) {
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

function setGlobalEditorPasteEventListener() {
	var gutenbergContainer = document.querySelector(".is-root-container");
	gutenbergContainer.removeEventListener(
		"paste",
		pasteOneTextLineEventHandler
	);
	gutenbergContainer.addEventListener("paste", pasteOneTextLineEventHandler);
}

/**
 * Create HOC to add spacing control to inspector controls of block.
 */
const withClipboardChanges = createHigherOrderComponent(
	(GutenbergComponent) => {
		return (props) => {
			useEffect(() => {
				setGlobalEditorPasteEventListener();
			}, []);
			return (
				<GutenbergComponent
					onPaste={pasteOneTextLineEventHandler()}
					onDrop={dropOneTextLineEventHandler}
					{...props}
				/>
			);
		};
	},
	"withClipboardChanges"
);

addFilter(
	"editor.BlockEdit",
	"single-line-text-only-paste/with-clipboard-changes",
	withClipboardChanges
);

const addDropAndPasteEventHandlers = (settings, name) => {
	settings.attributes["onPaste"] = {
		type: "function",
		default: pasteOneTextLineEventHandler,
	};
	settings.attributes["onDrop"] = {
		type: "function",
		default: dropOneTextLineEventHandler,
	};

	return settings;
};

addFilter(
	"blocks.registerBlockType",
	"single-line-text-only-paste/event-handlers",
	addDropAndPasteEventHandlers
);
