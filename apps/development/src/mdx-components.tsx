import React from "react";

export const components = {
  h1: (props: any) => <h1 className="pb-4 text-3xl font-semibold" {...props} />,
  h2: (props: any) => <h2 className="pb-2 pt-4 text-2xl font-semibold" {...props} />,
  h3: (props: any) => <h3 className="pt-2 text-lg font-semibold" {...props} />,
  p: (props: any) => <p className=" pb-4 leading-6" {...props} />,
  a: (props: any) => <a target="_blank" rel="noopener" className="pb-4 underline hover:no-underline" {...props} />,
  ul: (props: any) => <ul className="bullet list-inside list-disc pb-4 leading-6" {...props} />,
};
