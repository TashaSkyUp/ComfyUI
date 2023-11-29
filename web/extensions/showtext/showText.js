// Import necessary modules from specific paths.
import {app} from "../../../scripts/app.js";
import {ComfyWidgets} from "../../../scripts/widgets.js";

// The purpose of this code is to display input text on a node.

// Registering a new extension in the app with a unique name.
app.registerExtension({
    name: "pysssss.ShowText",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            onNodeCreated?.apply(this, arguments);
            // apply the widget style to the state display node
            if (nodeData.internal_state_display) {
                // the style is to be readonly and semi-transparent
                // and non interactive though they should be able to select it and copy its contents
                // only do this if this has widgets defined
                if (!nodeData.widgets) {
                    return;
                } else {
                    const widget = this.widgets.find((w) => w.name === nodeData.internal_state_display);
                    if (widget) {
                        widget.inputEl.readOnly = true;
                        widget.inputEl.style.opacity = 0.6;
                        //widget.inputEl.style.pointerEvents = "none";
                        widget.inputEl.style.userSelect = "text";
                        widget.inputEl.style.webkitUserSelect = "text";
                        widget.inputEl.style.msUserSelect = "text";
                        widget.inputEl.style.mozUserSelect = "text";


                    }
                }

            }
        }

        // Check if nodeData has a property 'internal_state_display' to identify nodes used for display.
        if (nodeData.internal_state_display) {
            // Debugging: print the nodeData to the console.
            console.log(nodeData)


            // Function to populate the node with text widgets.
            function populate(text) {
                this.display_widget_idx = this.widgets.findIndex((w) => w.name === nodeData.internal_state_display);
                // remove the widget with the name of the text display widget
                const widget = this.widgets.find((w) => w.name === nodeData.internal_state_display);
                if (widget) {
                    widget.onRemove?.();
                    this.widgets.splice(this.widgets.indexOf(widget), 1);
                    // now we need to remove the widget from the nodeData
                    // const nodeDataWidget = nodeData.widgets.find((w) => w.name === nodeData.internal_state_display);
                    // if (nodeDataWidget) {
                    //     nodeData.widgets.splice(nodeData.widgets.indexOf(nodeDataWidget), 1);
                    // }
                }


                // create a new widget with the name of the text display widget and the correct text
                const w = ComfyWidgets["STRING"](this, nodeData.internal_state_display, ["STRING", {multiline: true}], app).widget;
                // Make the widget's input element read-only and semi-transparent.
                w.inputEl.readOnly = true;
                w.inputEl.style.opacity = 0.6;
                //w.inputEl.style.pointerEvents = "none";
                w.inputEl.style.userSelect = "text";
                w.inputEl.style.webkitUserSelect = "text";
                w.inputEl.style.msUserSelect = "text";
                w.inputEl.style.mozUserSelect = "text";

                // if text has only one item then update the w.value directly without indexing
                if (text.length === 1) {
                    w.value = text[0];
                } else {
                    // Set the value of the widget to the current text item, use the correct item index
                    w.value = text[this.display_widget_idx];
                }


                // Adjust the node size after adding widgets.
                requestAnimationFrame(() => {
                    const sz = this.computeSize();
                    // Ensure the node size is not smaller than its initial size.
                    if (sz[0] < this.size[0]) {
                        sz[0] = this.size[0];
                    }
                    if (sz[1] < this.size[1]) {
                        sz[1] = this.size[1];
                    }
                    // Trigger a resize event with the new size.
                    this.onResize?.(sz);
                    // Mark the canvas as dirty to update the UI.
                    app.graph.setDirtyCanvas(true, false);
                });
            }

            // Override the 'onExecuted' method to display text when the node is executed.
            const onExecuted = nodeType.prototype.onExecuted;
            nodeType.prototype.onExecuted = function (message) {
                // Call the original 'onExecuted' method.
                onExecuted?.apply(this, arguments);
                // Populate the node with the text from the execution message.
                populate.call(this, message.text);
            };

            // Override the 'onConfigure' method to display stored widget values.
            const onConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function () {
                // Call the original 'onConfigure' method.
                //onConfigure?.apply(this, arguments);
                // If there are stored widget values, populate the node with these values.
                if (this.widgets_values?.length) {
                    populate.call(this, this.widgets_values);
                }
            };
        }
    },
});
