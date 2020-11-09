import type webpack from 'webpack'; // @types/webpack
import { preprocess } from './preprocess';

type LoaderContext = webpack.loader.LoaderContext & {
  getOptions?(): Readonly<Record<string, unknown>>;
};

export default function (this: LoaderContext, source: string): string | void {
  if (this.getOptions) {
    // webpack 5
    return preprocess(source, this.getOptions());
  } else {
    // webpack 4
    // Fall back to loader-utils.
    this.async();
    import('loader-utils')
      .then(loaderUtils =>
        this.callback(null, preprocess(source, loaderUtils.getOptions(this) || {})),
      )
      .catch((error: unknown) =>
        this.callback(error instanceof Error ? error : new Error('Unknown error'), ''),
      );
  }
}

export { preprocess };
