const EXAMPLES_DEFINITIONS = require('./EXAMPLES_DEFINITIONS.json')

const fs = require('fs')

EXAMPLES_DEFINITIONS.map(({ entries }) => entries)
  .flat()
  .forEach(({ id, title, description = '' }, i, self) => {
    fs.writeFile(
      `docs/${id}.markdown`,
      `
---
layout: post
id: '${id}'
title: '${title}'
description: '${
        Array.isArray(description) ? description.join('<br />') : description
      }'
prevDemoId: '${(self[i - 1] || self[self.length - 1]).id}'
prevDemoTitle: '${(self[i - 1] || self[self.length - 1]).title}'
nextDemoId: '${(self[i + 1] || self[0]).id}'
nextDemoTitle: '${(self[i + 1] || self[0]).title}'
---
`.trim(),
      () => {},
    )
  })
