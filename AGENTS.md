# Protocol Visualizer

Protocol Visualizer is a Vite powered web application that allows users to
visualize and interact with various communication protocols. For each protocol
it implements, It shows the structure of the message, the fields, and how it
passes from one entity to another where both interact via the chosen protocol.

## Features

- Support for listed protocols with terse and clear visualizations
    - I2C
    - SPI
    - UART
    - CAN
    - LIN
    - RS-232
- Visual representation of communication protocols
- Interactive exploration of message structures and fields
- Real-time simulation of protocol interactions with at least two entities
passing a message back and forth each other with user controllable timing and
message content.
- User-friendly interface for selecting protocols and configuring message
parameters.
- Responsive design for various screen sizes and devices.
- Extensible architecture to add new protocols and visualizations in the future.


## Technologies Used

- Vite: A fast and modern build tool for web applications.
- React: A JavaScript library for building user interfaces.
- TypeScript: A statically typed superset of JavaScript for improved code
quality.
- D3.js: A JavaScript library for creating dynamic and interactive data
visualizations.
- Tailwind CSS: A utility-first CSS framework for rapid UI development.
- React Router: A library for handling routing in React applications.

## Testing

- Unit tests for individual components and functions using Vitest.

## Deployment

- The application can be deployed to any static hosting service that supports
Vite applications, such as Vercel, Netlify, or GitHub Pages.

## Layout

- The application consists of a main dashboard where users can select the
protocol they want to visualize.
- Upon selecting a protocol, users are presented with a detailed view of the
protocol's message structure, fields, and interactions.
- The layout is designed to be intuitive and user-friendly, allowing users to
easily navigate between different protocols and explore their features.
- Design is modern and clean, with a focus on clarity and ease of use.
- The application is responsive, ensuring a seamless experience across various
devices and screen sizes.
