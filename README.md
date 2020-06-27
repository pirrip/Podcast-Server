Podcast-Server
==============

[![Join the chat at https://gitter.im/davinkevin/Podcast-Server](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/davinkevin/Podcast-Server?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/davinkevin/Podcast-Server.svg?branch=master)](https://travis-ci.org/davinkevin/Podcast-Server) 

Back-end : [![Codacy Badge](https://api.codacy.com/project/badge/Grade/2030290b1c2145f6878e9ad7811c542e)](https://www.codacy.com/app/davin-kevin/Podcast-Server?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=davinkevin/Podcast-Server&amp;utm_campaign=Badge_Grade) [![Coverage Status](https://coveralls.io/repos/davinkevin/Podcast-Server/badge.svg?branch=master)](https://coveralls.io/r/davinkevin/Podcast-Server?branch=master)

Front-end : [![Code Climate](https://codeclimate.com/github/davinkevin/Podcast-Server/badges/gpa.svg)](https://codeclimate.com/github/davinkevin/Podcast-Server)

Docker images : [![Backend](https://badgen.net/badge/docker/backend/blue?icon=docker)](https://hub.docker.com/r/podcastserver/backend) [![UI](https://badgen.net/badge/docker/ui/blue?icon=docker)](https://hub.docker.com/r/podcastserver/ui) [![File-System](https://badgen.net/badge/docker/file-system/blue?icon=docker)](https://hub.docker.com/r/podcastserver/file-system) [![Init-db](https://badgen.net/badge/docker/file-system/blue?icon=docker)](https://hub.docker.com/r/podcastserver/init-db)

Application design to be your Podcast local proxy in your lan network.

It also works on many sources like Youtube, Dailymotion, CanalPlus… Check this http://davinkevin.github.io/Podcast-Server/ and enjoy !

The application is available in [docker images](https://hub.docker.com/r/podcastserver/), see docker links above.

## Run in local env: 

### Building components for local use: 

* building base-image: `docker build -t podcastserver/backend-base-image:master -f backend/src/main/docker/base-image/Dockerfile .`
* building backend: `mvn clean flyway:clean flyway:migrate jooq-codegen:generate compile jib:dockerBuild -Ddatabase.url=jdbc:h2:/tmp/podcast-server -Dtag=local-dev`
* building ui: `env CI_COMMIT_TAG=latest ./ui/build.sh` (with both front already built before)
* building fs: `env CI_COMMIT_TAG=latest ./files-system/build.sh`

### Start components with Skaffold:

**Requirement**: Having a kubernetes ingress available in your `docker-for-desktop` install ([procject-contour](https://projectcontour.io/getting-started/))

* Set up your kubernetes context to `docker-for-desktop`
* Start every components: `./dev.sh`
* Access the application on `https://localhost/` and/or define a name alias in your `/etc/hosts` file
* (optional) if you want to rebuild the frontend (ui-v1) on change, execute `./mvnw -f frontend-angularjs/pom.xml frontend:gulp@skaffold-watch` in another terminal

## License

Copyright 2020 DAVIN KEVIN

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

