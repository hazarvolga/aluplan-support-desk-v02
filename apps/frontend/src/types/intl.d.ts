import tr from '../../messages/tr.json';

type Messages = typeof tr;

declare global {
    // Use type safe message keys with next-intl
    interface IntlMessages extends Messages { }
}
