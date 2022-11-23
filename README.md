# QKart-FrontEnd

## Overview
QKart is an E-commerce application offering a variety of products for customers to choose from. 

During the course of this project,
<ul>
<li>Implemented the core logic for authentication, shopping cart and checkout</li>
<li>Improved UI by adding responsive design elements for uniform experience across different devices</li>
<li>Utilized REST APIs to dynamically load and render data served by the backend server</li>
<li>Deployed website to Netlify</li>
</ul>
<br/>

<image src="project-structure-images/1-QKart-Component-Architecture.png" alt="component-architecture" width=100%/>
<p align="center"><b>Component Architecture</b></p>

<br/>

<image src="project-structure-images/2-QKart-Shopping-Interface-(Products-page).png" alt="QKart-Shopping-Interface-(Products-page).png" width=100%/>
<p align="center"><b>QKart Shopping Interface (Products page)</b></p>

<br/>

<hr>

<br/>

## Add Registration feature
### Scope of work
<ul>
<li>Implemented logic and used backend API to get the registration feature ready</li>
<li>Added validation for the register form user input values to display informative error messages.</li>
</ul>

### Skills used
React.js, Event Handling, Forms, React Hooks, REST API, Error Handling

<br/>

<hr>

<br/>

## Implement registration-login flow and set up routing
### Scope of work
<ul>
<li>Used React Router library to set up routes in the application and redirect customers to appropriate pages</li>
<li>Added UI and logic to get the Login page ready</li>
<li>Stored user information at client side using localStorage to avoid login on revisit.</li>
</ul>

### Skills used
React Router, Material UI, localStorage, Controlled Components, Conditional Rendering

<br/>

<image src="project-structure-images/3-Request-response-cycle-for-QKart-User-signup-and-login.png" alt="Request-response cycle for QKart User signup and login" width=100%/>
<p align="center"><b>Request-response cycle for QKart User signup and login</b></p>

<br/>

<image src="project-structure-images/4-User-flow-on-website-for-signup-and-login.png" alt="User-flow-on-website-for-signup-and-login.png" width=100%/>
<p align="center"><b>User flow on website for signup and login.png</b></p>

<br/>

<hr>

<br/>

## Display products and implement search feature
### Scope of work
<ul>
<li>Utilized the useEffect() hook to fetch products data after DOM is rendered for faster page loading</li>
<li>Added search bar to display only on the Products page’s header and implemented search logic</li>
<li>Implemented debouncing for improved UX and reduced API calls on search.</li>
</ul>

### Skills used
Keyword Search, Debouncing, Material UI Grid

<br/>

<image src="project-structure-images/5-QKart-Products-page.png" alt="QKart-Products-page.png" width=100%/>
<p align="center"><b>QKart Products page.png</b></p>

<br/>

<hr>

<br/>

## Add shopping cart and implement checkout flow
### Scope of work
<ul>
<li>Added Cart to Products page and made it responsive</li>
<li>Made authenticated POST API calls to implement Cart logic</li>
<li>Rendered Cart with differing designs in Products page and Checkout page using conditional rendering</li>
<li>Implemented UI and logic to add and select new addresses</li>
</ul>

### Skills used
Responsive Design, Reusable Components

<br/>

<image src="project-structure-images/6-Products-page-UI-with-responsive-Cart-design-Left-Desktop-Right-Mobile.png" alt="Products-page-UI-with-responsive-Cart-design-Left-Desktop-Right-Mobile.png" width=100%/>
<p align="center"><b>Products page UI with responsive Cart design Left Desktop Right Mobile</b></p>

<br/>

<image src="project-structure-images/7-QKart-Checkout-page.png" alt="QKart-Checkout-page.png" width=100%/>
<p align="center"><b>QKart Checkout page</b></p>

<br/>

<hr>

<br/>

## Deploy the QKart website
### Scope of work
<ul>
<li>Deployed the QKart React app to Netlify</li>
<li>Configured Netlify to support visiting any sub pages directly as React is a single page application</li>
</ul>

### Skills used
Deployment, Netlify