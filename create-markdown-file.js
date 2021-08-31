const EXAMPLES_DEFINITIONS = require('./EXAMPLES_DEFINITIONS.json')

const fs = require('fs')

EXAMPLES_DEFINITIONS.map(({ id }) => {
  fs.writeFile(
    `docs/${id}.markdown`,
    `
---
layout: post
title: 'Welcome to Jekyll!'
date: 2021-08-31 15:36:23 +0300
categories: jekyll update
---

<canvas id="gpu-c" />

<script src="/dist/basic/bundle.js"></script>
`.trim(),
    () => {},
  )
})
