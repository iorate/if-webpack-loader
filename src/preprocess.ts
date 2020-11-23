type IfBodySpan = {
  type: 'if-body';
  pre: string;
  cond: string;
  body: Span[];
  post: string;
};
type IfSpan = {
  type: 'if';
  pre: string;
  cond: string;
};
type ElifBodySpan = {
  type: 'elif-body';
  pre: string;
  cond: string;
  body: Span[];
  post: string;
};
type ElifSpan = {
  type: 'elif';
  pre: string;
  cond: string;
};
type ElseBodySpan = {
  type: 'else-body';
  pre: string;
  body: Span[];
  post: string;
};
type ElseSpan = {
  type: 'else';
  pre: string;
};
type EndifSpan = {
  type: 'endif';
  pre: string;
};
type TextSpan = {
  type: 'text';
  text: string;
};
type Span =
  | IfBodySpan
  | IfSpan
  | ElifBodySpan
  | ElifSpan
  | ElseBodySpan
  | ElseSpan
  | EndifSpan
  | TextSpan;

function parseSource(source: string): Span[] {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const spans: Span[] = [];
  let lastIndex = 0;
  const re = /((?<preM>\/\*[^\S\r\n]*#[^\S\r\n]*(?<typeM>if|elif|else|endif)(?![\w$])(?<condM>((?!\*\/).)*))(?<bodyM>\r?\n((?!\*\/)[\s\S])*)?(?<postM>\*\/))|(\/\*((?!\*\/)[\s\S])*\*\/)|(?<preS>\/\/\/?[^\S\r\n]*#[^\S\r\n]*(?<typeS>if|elif|else|endif)(?![\w$])(?<condS>.*))|(\/\/.*)/g;
  let m: RegExpExecArray | null = null;
  while ((m = re.exec(source))) {
    spans.push({ type: 'text', text: source.slice(lastIndex, m.index) });
    lastIndex = re.lastIndex;
    if (m.groups!.typeM != null) {
      if (m.groups!.typeM === 'if') {
        if (/^[^\S\r\n]*$/.test(m.groups!.condM!)) {
          throw new Error(
            `No cond for #if: ${m.groups!.preM!}${m.groups!.bodyM ? '' : m.groups!.postM}`,
          );
        }
        if (m.groups!.bodyM) {
          spans.push({
            type: 'if-body',
            pre: m.groups!.preM!,
            cond: m.groups!.condM!,
            body: parseSource(m.groups!.bodyM),
            post: m.groups!.postM!,
          });
        } else {
          spans.push({
            type: 'if',
            pre: `${m.groups!.preM!}${m.groups!.postM!}`,
            cond: m.groups!.condM!,
          });
        }
      } else if (m.groups!.typeM === 'elif') {
        if (/^[^\S\r\n]*$/.test(m.groups!.condM!)) {
          throw new Error(
            `No cond for #elif: ${m.groups!.preM!}${m.groups!.bodyM ? '' : m.groups!.postM!}`,
          );
        }
        if (m.groups!.bodyM) {
          spans.push({
            type: 'elif-body',
            pre: m.groups!.preM!,
            cond: m.groups!.condM!,
            body: parseSource(m.groups!.bodyM),
            post: m.groups!.postM!,
          });
        } else {
          spans.push({
            type: 'elif',
            pre: `${m.groups!.preM!}${m.groups!.postM!}`,
            cond: m.groups!.condM!,
          });
        }
      } else if (m.groups!.typeM === 'else') {
        if (!/^[^\S\r\n]*$/.test(m.groups!.condM!)) {
          throw new Error(
            `Cond for #else: ${m.groups!.preM!}${m.groups!.bodyM ? '' : m.groups!.postM!}`,
          );
        }
        if (m.groups!.bodyM) {
          spans.push({
            type: 'else-body',
            pre: m.groups!.preM!,
            body: parseSource(m.groups!.bodyM),
            post: m.groups!.postM!,
          });
        } else {
          spans.push({ type: 'else', pre: `${m.groups!.preM!}${m.groups!.postM!}` });
        }
      } else {
        if (!/^[^\S\r\n]*$/.test(m.groups!.condM!)) {
          throw new Error(
            `Cond for #endif: ${m.groups!.preM!}${m.groups!.bodyM ? '' : m.groups!.postM!}`,
          );
        }
        if (m.groups!.bodyM) {
          throw new Error(`Body for #endif: ${m.groups!.bodyM}`);
        }
        spans.push({ type: 'endif', pre: `${m.groups!.preM!}${m.groups!.postM!}` });
      }
    } else if (m.groups!.typeS != null) {
      if (m.groups!.typeS === 'if') {
        if (/^[^\S\r\n]*$/.test(m.groups!.condS!)) {
          throw new Error(`No cond for #if: ${m.groups!.preS!}`);
        }
        spans.push({ type: 'if', pre: m.groups!.preS!, cond: m.groups!.condS! });
      } else if (m.groups!.typeS === 'elif') {
        if (/^[^\S\r\n]*$/.test(m.groups!.condS!)) {
          throw new Error(`No cond for #elif: ${m.groups!.preS!}`);
        }
        spans.push({ type: 'elif', pre: m.groups!.preS!, cond: m.groups!.condS! });
      } else if (m.groups!.typeS === 'else') {
        if (!/^[^\S\r\n]*$/.test(m.groups!.condS!)) {
          throw new Error(`Cond for #else: ${m.groups!.preS!}`);
        }
        spans.push({ type: 'else', pre: m.groups!.preS! });
      } else {
        if (!/^[^\S\r\n]*$/.test(m.groups!.condS!)) {
          throw new Error(`Cond for #endif: ${m.groups!.preS!}`);
        }
        spans.push({ type: 'endif', pre: m.groups!.preS! });
      }
    } else {
      spans.push({ type: 'text', text: m[0] });
    }
  }
  spans.push({ type: 'text', text: source.slice(lastIndex) });
  return spans;
  /* eslint-enable */
}

type IfClause = {
  pre: string;
  cond: string;
  body: Section[];
  post: string[];
};
type ElifClause = {
  pre: string;
  cond: string;
  body: Section[];
  post: string[];
};
type ElseClause = {
  pre: string;
  body: Section[];
  post: string[];
};
type EndifClause = {
  pre: string;
};
type IfSection = {
  type: 'if';
  ifClause: IfClause;
  elifClauses: ElifClause[];
  elseClause?: ElseClause;
  endifClause: EndifClause;
};
type TextSection = {
  type: 'text';
  text: string;
};
type Section = IfSection | TextSection;

function accumulateSpans(spans: Span[]): Section[] {
  const sections: Section[] = [];
  const ifSections: Omit<IfSection, 'endifClause'>[] = [];
  const appendSection = (section: Section): void => {
    if (ifSections.length) {
      const ifSection = ifSections[ifSections.length - 1];
      if (ifSection.elseClause) {
        if (ifSection.elseClause.post.length) {
          if (section.type !== 'text') {
            throw new Error(`#endif expected: ${section.ifClause.pre}`);
          } else if (!/^\s*$/.test(section.text)) {
            throw new Error(`#endif expected: ${section.text}`);
          }
          ifSection.elseClause.post.push(section.text);
        } else {
          ifSection.elseClause.body.push(section);
        }
      } else if (ifSection.elifClauses.length) {
        const elifClause = ifSection.elifClauses[ifSection.elifClauses.length - 1];
        if (elifClause.post.length) {
          if (section.type !== 'text') {
            throw new Error(`#elif or #else or #endif expected: ${section.ifClause.pre}`);
          } else if (!/^\s*$/.test(section.text)) {
            throw new Error(`#elif or #else or #endif expected: ${section.text}`);
          }
          elifClause.post.push(section.text);
        } else {
          elifClause.body.push(section);
        }
      } else if (ifSection.ifClause) {
        if (ifSection.ifClause.post.length) {
          if (section.type !== 'text') {
            throw new Error(`#elif or #else or #endif expected: ${section.ifClause.pre}`);
          } else if (!/^\s*$/.test(section.text)) {
            throw new Error(`#elif or #else or #endif expected: ${section.text}`);
          }
          ifSection.ifClause.post.push(section.text);
        } else {
          ifSection.ifClause.body.push(section);
        }
      }
    } else {
      sections.push(section);
    }
  };
  for (const span of spans) {
    if (span.type === 'if-body') {
      ifSections.push({
        type: 'if',
        ifClause: {
          pre: span.pre,
          cond: span.cond,
          body: accumulateSpans(span.body),
          post: [span.post],
        },
        elifClauses: [],
      });
    } else if (span.type === 'if') {
      ifSections.push({
        type: 'if',
        ifClause: {
          pre: span.pre,
          cond: span.cond,
          body: [],
          post: [],
        },
        elifClauses: [],
      });
    } else if (span.type === 'elif-body') {
      if (!ifSections.length) {
        throw new Error(`#elif not preceded by #if: ${span.pre}`);
      }
      const ifSection = ifSections[ifSections.length - 1];
      if (ifSection.elseClause) {
        throw new Error(`#elif following #else: ${span.pre}`);
      }
      ifSection.elifClauses.push({
        pre: span.pre,
        cond: span.cond,
        body: accumulateSpans(span.body),
        post: [span.post],
      });
    } else if (span.type === 'elif') {
      if (!ifSections.length) {
        throw new Error(`#elif not preceded by #if: ${span.pre}`);
      }
      const ifSection = ifSections[ifSections.length - 1];
      if (ifSection.elseClause) {
        throw new Error(`#elif following #else: ${span.pre}`);
      }
      ifSection.elifClauses.push({
        pre: span.pre,
        cond: span.cond,
        body: [],
        post: [],
      });
    } else if (span.type === 'else-body') {
      if (!ifSections.length) {
        throw new Error(`#else not preceded by #if: ${span.pre}`);
      }
      const ifSection = ifSections[ifSections.length - 1];
      if (ifSection.elseClause) {
        throw new Error(`#else following #else: ${span.pre}`);
      }
      ifSection.elseClause = {
        pre: span.pre,
        body: accumulateSpans(span.body),
        post: [span.post],
      };
    } else if (span.type === 'else') {
      if (!ifSections.length) {
        throw new Error(`#else not preceded by #if: ${span.pre}`);
      }
      const ifSection = ifSections[ifSections.length - 1];
      if (ifSection.elseClause) {
        throw new Error(`#else following #else: ${span.pre}`);
      }
      ifSection.elseClause = {
        pre: span.pre,
        body: [],
        post: [],
      };
    } else if (span.type === 'endif') {
      const ifSection = ifSections.pop();
      if (!ifSection) {
        throw new Error(`#endif not preceded by #if: ${span.pre}`);
      }
      appendSection({
        ...ifSection,
        endifClause: {
          pre: span.pre,
        },
      });
    } else {
      appendSection({
        type: 'text',
        text: span.text,
      });
    }
  }
  if (ifSections.length) {
    const ifSection = ifSections[ifSections.length - 1];
    throw new Error(`Unclosed #if: ${ifSection.ifClause.pre}`);
  }
  return sections;
}

function commentOutText(text: string): string {
  let result = '';
  const split = text.split(/(\r?\n)/);
  for (let i = 0; i < split.length; ++i) {
    if (i & 1) {
      result += split[i];
    } else {
      result += '*'.repeat(split[i].length);
    }
  }
  result = '/' + result.slice(1, -1) + '/';
  return result;
}

function evaluateCondition(cond: string, env: Readonly<Record<string, unknown>>): unknown {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const f = new Function(...Object.keys(env), `return (${cond});`);
  return f(...Object.values(env));
}

function joinSections(sections: Section[]): string {
  let result = '';
  for (const section of sections) {
    if (section.type === 'if') {
      result +=
        section.ifClause.pre + joinSections(section.ifClause.body) + section.ifClause.post.join('');
      for (const elifClause of section.elifClauses) {
        result += elifClause.pre + joinSections(elifClause.body) + elifClause.post.join('');
      }
      if (section.elseClause) {
        result +=
          section.elseClause.pre +
          joinSections(section.elseClause.body) +
          section.elseClause.post.join('');
      }
      result += section.endifClause.pre;
    } else {
      result += section.text;
    }
  }
  return result;
}

function processSections(sections: Section[], env: Readonly<Record<string, unknown>>): string {
  let result = '';
  for (const section of sections) {
    if (section.type === 'if') {
      let pre = '';
      let body = '';
      let post = '';
      let hit = false;
      if (evaluateCondition(section.ifClause.cond, env)) {
        pre += section.ifClause.pre;
        body = processSections(section.ifClause.body, env);
        post += section.ifClause.post.join('');
        hit = true;
      } else {
        pre +=
          section.ifClause.pre +
          joinSections(section.ifClause.body) +
          section.ifClause.post.join('');
      }
      for (const elifClause of section.elifClauses) {
        if (hit) {
          post += elifClause.pre + joinSections(elifClause.body) + elifClause.post.join('');
        } else if (evaluateCondition(elifClause.cond, env)) {
          pre += elifClause.pre;
          body = processSections(elifClause.body, env);
          post += elifClause.post.join('');
          hit = true;
        } else {
          pre += elifClause.pre + joinSections(elifClause.body) + elifClause.post.join('');
        }
      }
      if (section.elseClause) {
        if (hit) {
          post +=
            section.elseClause.pre +
            joinSections(section.elseClause.body) +
            section.elseClause.post.join('');
        } else {
          pre += section.elseClause.pre;
          body = processSections(section.elseClause.body, env);
          post += section.elseClause.post.join('');
          hit = true;
        }
      }
      if (hit) {
        post += section.endifClause.pre;
      } else {
        pre += section.endifClause.pre;
      }
      result += commentOutText(pre) + body + (post ? commentOutText(post) : '');
    } else {
      result += section.text;
    }
  }
  return result;
}

export function preprocess(source: string, env: Readonly<Record<string, unknown>>): string {
  return processSections(accumulateSpans(parseSource(source)), env);
}
