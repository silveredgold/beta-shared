# `beta-shared`: Shared Components for use in Beta Platform tools

This package is designed to contain as much of the shared logic, abstractions and types as possible from any tools interacting with what I have started referring to as the Beta Platform tools. That currently includes Beta Protection and Beta Censoring, both of which use this package heavily.

Additionally, this packages serves as the closest things those tools have to an API specification. As an example, the APIs in this package are what Beta Protection and Beta Censoring use to communicate with each other.

The types and logic in this package are designed for maximum portability so they don't even assume what environment they will run in, just anywhere JS does. That being said, it is designed primarily for a browser environment, but that's about it. 