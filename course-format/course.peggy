{
  function metadataObject(entries) {
    return Object.fromEntries(entries.map((entry) => [entry.key, entry.value]));
  }

  function clean(value) {
    return value.trim();
  }
}

Document
  = BlankLine* title:CourseTitle metadata:(BlankLine* entry:MetadataLine { return entry; })* sections:Section+ BlankLine* End {
      const meta = metadataObject(metadata);
      return {
        title,
        slug: meta.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        description: meta.description || "",
        order: Number(meta.order || 999),
        sections,
      };
    }

CourseTitle
  = "#" HSpace text:NonEmptyLine LineEnd { return clean(text); }

MetadataLine
  = "@" key:Identifier ":" HSpace value:NonEmptyLine LineEnd {
      return { key, value: clean(value) };
    }

Section
  = BlankLine* "@section" HSpace id:Slug HSpace "|" HSpace label:NonEmptyLine LineEnd blocks:Block* {
      return {
        id,
        label: clean(label),
        blocks: blocks.filter(Boolean),
      };
    }

Block
  = Component
  / Heading
  / UnorderedList
  / Quote
  / Paragraph
  / BlankLine { return null; }

Component
  = "::component" HSpace name:ComponentName LineEnd body:$((!"::end" .)*) "::end" LineEnd {
      let props;
      try {
        props = JSON.parse(body.trim());
      } catch (cause) {
        error(`Invalid JSON for component ${name}: ${cause.message}`);
      }
      return { type: "component", name, props };
    }

Heading
  = marks:("###" / "##") HSpace text:NonEmptyLine LineEnd {
      return { type: "heading", depth: marks.length, text: clean(text) };
    }

UnorderedList
  = items:ListItem+ { return { type: "list", items }; }

ListItem
  = "-" HSpace text:NonEmptyLine LineEnd { return clean(text); }

Quote
  = lines:QuoteLine+ { return { type: "quote", text: lines.join(" ") }; }

QuoteLine
  = ">" HSpace text:NonEmptyLine LineEnd { return clean(text); }

Paragraph
  = lines:ParagraphLine+ { return { type: "paragraph", text: lines.join(" ") }; }

ParagraphLine
  = !SectionStart !ComponentStart !HeadingStart !ListStart !QuoteStart text:NonEmptyLine LineEnd {
      return clean(text);
    }

SectionStart = "@section"
ComponentStart = "::component"
HeadingStart = "##"
ListStart = "-" HSpace
QuoteStart = ">" HSpace

Identifier = $([a-zA-Z][a-zA-Z0-9_-]*)
ComponentName = $([A-Z][a-zA-Z0-9]*)
Slug = $([a-z0-9][a-z0-9-]*)
NonEmptyLine = $([^\r\n]+)
BlankLine = [ \t]* Newline
HSpace = [ \t]+
LineEnd = Newline / &End
Newline = "\r\n" / "\n" / "\r"
End = !.
