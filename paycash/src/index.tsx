import camelcase from 'camelcase';
import { PayCash, PayCashProps, Widget, WidgetProps } from 'paycash';
import { h } from 'preact';
import { render } from 'preact/compat';

declare global {
  interface Window {
    WebKitMutationObserver: any;
  }
}

if (typeof window !== 'undefined') {
  init();
}

function init() {
  function render() {
    let paycashDivID: string = '';
    let createdInJS: boolean = false;
    //prevent firing multiple times
    window.onload = () => {
      const yes = document.scripts;

      for (let i = 0; i < yes.length; i++) {
        const each = yes[i].innerHTML;
        let split = each.split('PayCash.render(document.getElementById(')
        if (split.length > 1) {
          let id: any = split[1].split(`'`)
          createdInJS = true;
          paycashDivID = id[1]
        }
      }

      const javascriptDivExists = document.getElementById(paycashDivID);

      if (createdInJS && javascriptDivExists === null) {
        return console.error(`The Paycash div#${paycashDivID} is either misspelled or missing.`)
      } else if (createdInJS) {
        return
      } else {
        const paycashExists: boolean = document.getElementsByClassName('paycash').length > 0
        const widgetExists: boolean = document.getElementsByClassName('paycash-widget').length > 0
        renderButtons(widgetExists, paycashExists);
        renderWidgets(widgetExists, paycashExists);
      }
    }

  }


  document.addEventListener('DOMContentLoaded', render);

  const MutationObserver = window.MutationObserver ?? window.WebKitMutationObserver;
  const observer = new MutationObserver(render);
  observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
  });

}

const allowedProps = [
  'amount',
  'animation',
  'currency',
  'displayCurrency',
  'hideToasts',
  'hoverText',
  'onSuccess',
  'onTransaction',
  'randomSatoshis',
  'successText',
  'theme',
  'text',
  'to',
  'disabled',
  'goalAmount',
  'editable'
];

const requiredProps = [
  'to',
];


export function renderButtons(widgetExists: boolean, paycashExists: boolean): void {

  if (!widgetExists && !paycashExists) {
    console.error('The "paycash" class is either misspelled or missing.')
  } else {
    findAndRender('paycash', PayCash, allowedProps, requiredProps);
  }
}

export function renderWidgets(widgetExists: boolean, paycashExists: boolean): void {
  if (!widgetExists && !paycashExists) {
    console.error('The "paycash-widget" class is either misspelled or missing.')
  } else {
    findAndRender('paycash-widget', Widget, allowedProps, requiredProps);
  }
}

function findAndRender<T>(className: string, Component: React.ComponentType<any>, allowedProps: string[], requiredProps: string[]) {
  Array
    .from(document.getElementsByClassName(className))
    .forEach(el => {

      const attributes = el.getAttributeNames()
        .reduce(
          (attributes: Record<string, string>, name: string) => {
            const prop = camelcase(name);
            if (allowedProps.includes(prop))
              attributes[prop] = el.getAttribute(name)!;
            return attributes;
          }, {}
        )
        ;

      const props: Record<string, any> = Object.assign({}, attributes, { to: attributes.to });

      if (attributes.amount != null) {
        props.amount = +attributes.amount;
        if (isNaN(props.amount)) {
          console.error('Amount must be a number')
        }
      }

      props.hideToasts = attributes.hideToasts === 'true';
      props.randomSatoshis = attributes.randomSatoshis === 'true';

      if (attributes.onSuccess) {
        const geval = window.eval;
        props.onSuccess = () => geval(attributes.onSuccess);
      }

      if (attributes.onTransaction) {
        const geval = window.eval;
        props.onTransaction = () => geval(attributes.onTransaction);
      }

      if (attributes.theme) {
        try {
          props.theme = JSON.parse(attributes.theme)
        } catch {
          // Keep the original string assignment
        }
      }

      if (!requiredProps.every(name => name in attributes)) {
        /*         console.error('paycash: missing required attribute: ' + JSON.stringify(requiredProps.filter(name => !(name in attributes)))); */
        // return;
        console.error('The "to" parameter is missing from your config var. Please check it')
      }

      //    el.classList.remove(className);

      render(<Component {...props} />, el)
    });
}

const validateJSProps = (props: PayCashProps) => {
  if (props.amount !== null && props.amount !== undefined) {
    props.amount = +props.amount

    if (isNaN(props.amount)) {
      console.error('Amount must be a number')
    }
  }

  // validate the rest of the props
}

export default {
  render: (el: HTMLElement, props: PayCashProps) => {
    if (el !== null) {
      validateJSProps(props)
      render(<PayCash {...props} />, el)
    }
  },
  renderWidget: (el: HTMLElement, props: WidgetProps) => {
    if (el !== null) {
      validateJSProps(props)
      render(<Widget {...props} />, el)
    }
  }
};