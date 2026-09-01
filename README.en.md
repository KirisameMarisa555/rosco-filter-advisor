# Rosco Filter Advisor

Rosco Filter Advisor is a color-temperature planning tool for lighting tests, photography, and film/video fixture correction. Set the original source and the desired converted source, and the app calculates the Mired Shift, then recommends Rosco correction filters that closely match the target shift.

The project is a standalone React + Vite PWA. It can be installed on desktop or mobile devices, and after the first successful load it keeps the calculator and local filter data available offline.

## What it is for

- Quickly calculate the Mired Shift between two color temperatures
- Find Rosco correction filters close to the target shift
- Compare single-filter and stacked-filter recommendations
- Keep language and theme preferences across future visits

## Features

- Calculate Mired Shift with Original Source and Converted Source sliders
- Recommend warming or cooling Rosco correction filters based on shift direction
- Optional stacked-filter recommendations using additive Mired values
- Show filter color, model code, and matching distance
- Chinese / English interface
- Multiple visual themes
- Language and theme preferences saved in the local browser
- PWA installation and offline use

## Data Source

Filter data was extracted from `doc/rosco色温片参数.xlsx` into `src/data/roscoFilters.js`. The Excel file is kept in the repository as source documentation only and is not read by the app at runtime. The app uses the local JavaScript dataset and does not require a remote API.

## Start

```bash
cd /Volumes/Marisa_Data_A/color-tools/rosco-filter-advisor
npm install
npm run dev
```

The development server is usually available at:

```text
http://127.0.0.1:5174/
```

## Build and preview the PWA

```bash
npm run build
npm run preview
```

PWA installation and service workers generally require localhost or HTTPS. Open the preview URL, then choose “Install app” from the browser address bar or menu to install the tool on a desktop or mobile device.

After the first page load completes, the service worker caches the HTML, JavaScript, CSS, icons, and local filter data. The calculator and filter recommendations remain available when the device is temporarily offline.
