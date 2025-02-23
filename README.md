[![npm version](https://img.shields.io/docker/pulls/raiper34/vl-downloader)](https://hub.docker.com/repository/docker/raiper34/vl-downloader/general)
[![npm version](https://img.shields.io/docker/image-size/raiper34/vl-downloader)](https://hub.docker.com/repository/docker/raiper34/vl-downloader/general)
[![npm version](https://img.shields.io/docker/stars/raiper34/vl-downloader)](https://hub.docker.com/repository/docker/raiper34/vl-downloader/general)
[![docs](https://badgen.net/badge/docs/online/orange)](https://vl-downloader.netlify.app)
[![GitHub License](https://img.shields.io/github/license/raiper34/vl-downloader)](https://github.com/Raiper34/vl-downloader)
[![GitHub Repo stars](https://img.shields.io/github/stars/raiper34/vl-downloader)](https://github.com/Raiper34/vl-downloader)

![vl-downloader logo](assets/logo.svg)
# VL Downloader - self-hosted Vimm's Lair rom downloader

VL Downloader is self-hosted [Vimm's Lair](https://vimm.net/) rom downloader.
It is able to download ROMs directly from VL website into your home lab/nas/multimedia server and it also supports adding ROMs to the download queue and able to download multiple ROMs without extra interaction.
The project is based on NestJS and Angular.

> [!IMPORTANT]
> Please do not use this tool for piracy! Download only ROMs your own rights!

> [!IMPORTANT]
> Please copy and paste the link from VL website one by one, to generate VM author some revenue from ads also, do not download constantly large numbers of rooms, do not slow VL website this way! Please also do not modify this tool to be able to download large numbers of ROMs at once. It is designed to download ROM one by one to not be too aggressive for the website!

![demo](assets/demo.gif)

### Content
- [🚀 Installation](#-instalation)
- [📖 License](#-license)

# 🚀 Installation
Recommended and the easiest way how to start to use of VL downloader is using docker.
```bash
docker run -d -p 3000:3000 -v /path/to/downloads:/vl-downloader/backend/downloads raiper34/vl-downloader:latest
```

# 📖 License
MIT