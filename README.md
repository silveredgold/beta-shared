# `beta-shared`: Shared Components for use in Beta Platform tools

This repo serves as a shared home for the Beta Platform tools as well, so additional information is included below.

## Beta Platform

The Beta Platform is the moniker I have started using to refer to tools based on a shared set of functionality around beta software, particularly censoring. The Beta Platform tools are designed around a few guiding principles:

- **Always open-source**
- Highly configurable and extensible
- Open and flexible APIs for shared functionality

This means that my software can ideally be not just used by any other betas in the community but also extended, remixed, built on top of and generally used in a variety of contexts. This is also designed such that if developers want to build their own beta-focussed software, they might be able to skip some of the hard work. For example, Beta Censoring can handle neural net-based detection, classification and censoring of NSFW images through a set of flexible APIs so that you don't have to reimplement this yourself unless you want to.

#### Developers

Looking to build something with the Beta Platform and have some questions? Try opening a Discussion on this repo on GitHub, or contact me directly on Discord and I'm happy to discuss things. I'm aware the documentation is a bit rough, but it's a lot of work.

## `beta-shared`

This repository is a store of much of the shared logic, abstractions and types as possible from any tools interacting with the Beta Platform tools. That currently includes Beta Protection and Beta Censoring, both of which use this package heavily.

Additionally, this packages serves as the closest things those tools have to an API specification. As an example, the APIs in this package are what Beta Protection and Beta Censoring use to communicate with each other.

The types and logic in this package are designed for maximum portability so they don't even assume what environment they will run in, just anywhere JS does. That being said, it is designed primarily for a browser environment, but that's about it. 