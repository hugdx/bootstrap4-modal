class BootstrapModal {
    /**
     * @callback onClose
     * @param {BootstrapModal} modal
     *
     * @callback onShow
     * @param {BootstrapModal} modal
     *  *
     * @callback onButtonClick
     * @param {event} event
     * @param {HTMLElement} button
     * @param {BootstrapModal} modal
     */

    /**
     * @param {Object} option
     * @param {string|Object} [option.title = '']
     * @param {string} [option.id = '']
     * @param {string} [option.content = ""]
     * @param {string} [option.css_class = ""]
     * @param {string} [option.css_class_header = ""]
     * @param {string} [option.css_class_body = ""]
     * @param {string} [option.css_class_footer = ""]
     * @param {string} [option.attrs = ""]
     * @param {boolean} [option.vertically_center = true]
     * @param {boolean} [option.btn_close = true]
     * @param {boolean} [option.backdrop = true]
     * @param {boolean} [option.sticky = true]
     * @param {boolean} [option.auto_show = true]
     * @param {boolean} [option.header = true]
     * @param {boolean} [option.footer = true]
     * @param {boolean} [option.effect = true]
     * @param {boolean} [option.destroy_after_close = true]
     * @param {Array} [option.buttons = []]
     * @param {boolean} [option.hide_other = false]
     * @param {onClose} [option.on_close]
     * @param {onShow} [option.on_show]
     *
     * @param {string} [option.buttons[].id]
     * @param {string} [option.buttons[].attrs]
     * @param {string} [option.buttons[].css_class]
     * @param {string} [option.buttons[].icon]
     * @param {string} [option.buttons[].label]
     * @param {onButtonClick} [option.buttons[].on_click]
     *
     * @param {string} [option.title.label = '']
     * @param {Array} [option.title.buttons = []]
     * @param {string} [option.title.buttons[].id]
     * @param {string} [option.title.buttons[].attrs]
     * @param {string} [option.title.buttons[].css_class]
     * @param {string} [option.title.buttons[].icon]
     * @param {string} [option.title.buttons[].label]
     * @param {onButtonClick} [option.title.buttons[].on_click]
     */
    constructor(option) {
        this.id = '';
        this.css_class_instance = 'BootstrapModal_' + BootstrapModal.getNextId();
        this.$modal = false;
        this.showing = false;

        this.vertically_center = true;
        this.title = '';
        this.content = "";
        this.css_class = "";
        this.css_class_header = "";
        this.css_class_body = "";
        this.css_class_footer = "";
        this.attrs = "";
        this.btn_close = true;
        this.backdrop = true;
        this.sticky = true;
        this.auto_show = true;
        this.header = true;
        this.footer = true;
        this.effect = true;
        this.destroy_after_close = true;
        this.buttons = [];
        this.hide_other = false;

        this.on_close = false;
        this.on_show = false;

        for (let option_key in option) {
            if (!option.hasOwnProperty(option_key)) {
                continue;
            }

            if (option_key === 'show') {
                this.auto_show = option[option_key];
            } else {
                this[option_key] = option[option_key];
            }
        }

        if (this.auto_show) {
            this.show();
        }
    }

    static getNextId() {
        return ++BootstrapModal.count;
    }

    show() {
        if (!this.$modal) {
            this.render();
        }

        // fix bug: events will be remove when call .remove()
        if (this.destroy_after_close || !this.$modal.initedEvent) {
            this.$modal.initedEvent = true;
            this.$modal
                .data('h2d2-modal', this)
                .on('hidden.bs.modal', this.onHide.bind(this))
                .on('shown.bs.modal', this.onShow.bind(this))
            ;
        }

        this.$modal.modal('show');
    }

    hide() {
        this.$modal && this.$modal.modal('hide');
    }


    render() {
        let attrs = ' data-backdrop="' + (this.sticky && this.backdrop ? 'static' : this.backdrop ? "true" : "false") + '"';
        if (this.sticky) {
            attrs += ' data-keyboard="false" aria-hidden="true"';
        }

        let css_class = 'modal BootstrapModal ' + this.css_class + ' ' + this.effect;
        this.$modal = $(`
            <div tabindex="-1" role="dialog" id="` + this.id + `" class="` + css_class + `" ` + attrs + `>
                <div class="modal-dialog ` + (this.vertically_center ? 'modal-dialog-centered' : '') + `" role="document">
                    <div class="modal-content"></div>
                </div>
            </div>`
        );
        this.$modal
            .find('.modal-content')
            .append(this.renderHeader())
            .append(this.renderBody())
            .append(this.renderFooter());
    }

    renderHeader() {
        if (this.header === false) {
            return;
        }

        const $header = $('<div class="modal-header"></div>').addClass(this.css_class_header);
        if (this.title) {
            if (this.title instanceof Object) {
                $header.append($('<h4 class="modal-title"></h4>').append(this.title.label || ''));
                this.title.buttons && $header.append($('<div class="modal-header-btn-group"></div>').append(this.renderButtons(this.title.buttons)));
            } else {
                $header.append($('<h4 class="modal-title"></h4>').append(this.title));
            }
        }

        if (this.btn_close) {
            $header.append('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
        }

        return $header
    }

    /**
     * change header
     * @param title
     * @return {BootstrapModal}
     */
    setHeader(title) {
        this.header = true;
        this.title = title;
        if (this.$modal) {
            this.$modal.find('.modal-header:first').remove();
            this.$modal.find('.modal-body:first').before(this.renderHeader());
        }

        return this;
    }


    /**
     * Change body of modal
     * @param content
     * @return {BootstrapModal}
     */
    setBody(content) {
        this.content = content;
        if (this.$modal) {
            this.$modal.find('.modal-body:first').replace(this.renderBody());
        }
        return this;
    }

    renderBody() {
        return $('<div class="modal-body"></div>').addClass(this.css_class_body).append(this.content);
    }


    renderFooter() {
        if (this.footer === false) {
            return;
        }

        let $footer = $('<div class="modal-footer"></div>').addClass(this.css_class_footer);
        let $buttons = this.renderButtons(this.buttons);
        if ($buttons) {
            $footer.get(0).appendChild($buttons);
        }
        return $footer;
    };

    /**
     *
     * @param {Array} button_list
     * @return {*}
     */
    renderButtons(button_list) {
        if (!button_list) {
            return;
        }

        const that = this;
        let buttonsFragment = document.createDocumentFragment();
        button_list.forEach(function (button) {
            let $button = $(
                '<button type="button"' + (button.id ? ' id="' + button.id + '"' : '') +
                (button.attrs ? button.attrs : '') + ' class="btn ' +
                (button.css_class ? button.css_class : ' btn-light') + '">' +
                (button.icon ? '<i class="' + button.icon + '"></i> ' : '') +
                '</button>')
            ;

            if (button.label) {
                $button.append(button.label);
            }

            button.on_click && $button.click(function (e) {
                return button.on_click.call(null, e, this, that);
            });
            buttonsFragment.appendChild($button.get(0));
        });

        return buttonsFragment;
    }

    onShow() {
        if (this.hide_other) {
            const css_class = "hide_" + this.css_class_instance;
            $('.modal').not(this.$modal).addClass(css_class);
        }

        this.showing = true;
        this.on_show && this.on_show.call(null, this);
    }

    onHide() {
        if (this.on_close && this.on_close.call(null, this) === false) {
            return;
        }

        this.showing = false;
        this.destroy_after_close && this.$modal.remove();

        if (this.hide_other) {
            const css_class = "hide_" + this.css_class_instance;
            $('.' + css_class).removeClass(css_class);
        }

        if ($("body>.modal:visible").length) {
            $("body").addClass('modal-open');
        }
    }


    /**
     * add css class to modal-header/modal-body/modal-footer
     * @param {String} css_class
     * @param {String} position [header, body, footer]
     * @returns {BootstrapModal}
     * @private
     */
    addCssClass(css_class, position) {
        this.$modal.find('.modal-' + position + ':first').addClass(css_class);
        return this;
    }

    /**
     * change header
     * @param {String} css_class
     * @returns {BootstrapModal}
     */
    addHeaderCssClass(css_class) {
        return this.addCssClass(css_class, 'header');
    }

    /**
     * change header
     * @param {String} css_class
     * @returns {BootstrapModal}
     */
    addBodyCssClass(css_class) {
        return this.addCssClass(css_class, 'body');
    }

    /**
     * change header
     * @param {String} css_class
     * @returns {BootstrapModal}
     */
    addFooterCssClass(css_class) {
        return this.addCssClass(css_class, 'footer');
    }


    /**
     * @return {jQuery|*}
     */
    getDialogBody() {
        return this.$modal ? this.$modal.find('.modal-body:first') : jQuery;
    }
}

BootstrapModal.count = 1;

function ModalConfirm(title, message, callback) {
    return new BootstrapModal({
        title: title,
        content: message,
        auto_show: true,
        user_selected: -1,
        buttons: [
            {
                label: "Yes",
                icon: "fa fa-check",
                css_class: 'btn-primary',
                on_click: function (event, btn, modal) {
                    modal.user_selected = true;
                    return callback.call(null, true, btn, modal);
                }
            }, {
                label: "No",
                icon: "fa fa-remove",
                css_class: 'btn-warning',
                on_click: function (event, btn, modal) {
                    modal.user_selected = false;
                    return callback.call(null, false, btn, modal);
                }
            }
        ],
        on_close: function (modal) {
            if (modal.user_selected === -1) {
                return callback.call(null, false, null, modal);
            }
        }
    });
}
