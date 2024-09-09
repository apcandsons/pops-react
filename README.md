# POPS React

POPS React is a React component library that provides a simple way to integrate policy agreements that are managed by
the cloud service [Policy-Ops](https://pops.apcandsons.com) into your React applications. It is designed to help
developers easily manage and display policy agreements, track user consent, and store agreement evidence.

## Introduction

In today's digital landscape, legal compliance is more critical than ever, particularly concerning user agreements for 
service policies such as terms of use, privacy policies, and security policies. Regulatory requirements and user trust 
hinge on a company’s ability to maintain accurate records of user agreements, especially when policy updates necessitate 
explicit user consent.

However, managing these legal processes can be cumbersome for legal teams and developers alike. Legal teams often 
struggle to efficiently manage policy versions and track user consent, while developers are burdened with integrating 
these changes into their applications, often requiring additional database configurations to persist user agreements.

### Key Features

The Policy-Ops project will include the following key features:

1. **Policy Versioning:** The system will maintain a history of policy versions and user agreements, ensuring that the company is always audit-ready and compliant with regulatory standards.
2. **User Agreement Component:** A reusable React component that developers can easily integrate into their projects. This component will handle the display of policy agreements, user consent tracking, and storage of agreement evidence.

Alright... Let's get started! 🚀

## Installation

To run this project locally, follow these steps:

```bash
npm install --save @apcandsons/pops-react
```

## Usage

### Policy Component

The Policy component is used to display the policy to the user
and to allow the user to agree to the policy.

```jsx title="pages/policies/terms-of-use.jsx"
import React from 'react';
import { Policy } from '@apcandsons/pops-react';

export default function TermsOfUse() {
    return (
        <Policy
            serviceId="cm0plu1gk0001148XXXXX"
            policyKey="terms-of-use"
        />
    )
}
```

Where:
* `serviceId` is the unique identifier for the Legal Opt-in API.
* `policyKey` is the unique identifier for the policy.

### Opt-in Component

Generally, the Legal Opt-in component can be placed on the
near-top level of your application to ensure that it is always
visible to the user.

However, it order to ensure that user information is provided
to determine if the user has already agreed to the terms,
the Legal Opt-in component should be placed within a context
that provides the user information.

```jsx title="_app.jsx"
import React from 'react';
import { OptInProvider } from '@apcandsons/pops-react';

function AppContent({ pageProps, Component }) {
    const currentUser = useMe()
    return (
        <div>
            <Component {...pageProps} />
            <OptInProvider
                serviceId="cm0plu1gk0001148XXXXX"
                userId={currentUser.email}
                userProperties={{
                    role: currentUser.role,
                    orgId: currentUser.organizationId,
                }}
            />
        </div>
    )
}

export default function App({ Component, pageProps }) {
    return (
        <SomeOtherProvider>
            <AppContent Component={Component} pageProps={pageProps} />
        </SomeOtherProvider>
    )
}
```

Where
* `serviceId` is the unique identifier for the Policy-Ops API.
* `userId` is the unique identifier for the user.
* `userProperties` is an arbitrary additional information about the user.
    * Keys that appea in this object need to be defined in the Legal Opt-in API, otherwise, they'll be rejected.
* `apiBaseUrl` is the base URL for the Policy-Ops API. By default it would connect to the cloud hosted version (Optional)

## Additional Information

### CORS

### Signed Requests

You can use signed requests to ensure that the request to the Policy-Ops API is coming from a trusted source.
To Opt-in with a signed request, you need provide `OptInProvider` with a signed `userProperties`.

The challenge is that to sign the request, you need to generate a signature on the server side to keep the key secret.
This means that you need to have a server that can sign the request.

On the server-side, suppose you have an endpoint that you can request user information:
```javascript
'use server'

import { sign } from '@apcandsons/pops-react';

export async function getMe() {
    const session = await getSession()
    const signedUserProperties = await sign({
        userId: currentUser.email,
        role: currentUser.role,
        orgId: currentUser.organization
    }, process.env.POPS_SECRET_KEY)
    return {
       ...session.currentUser,
       signedUserProperties,
    }
}
```

* Note that `userId` is required in the signed request.
* `POPS_SECRET_KEY` is a secure random generated on Pops API Server.

On the client side, you can use this server-generated signature and provide it to `OptInProvider`

```jsx title="_app.jsx"
'use client'

import React from 'react';
import { OptInProvider } from '@apcandsons/pops-react';

function AppContent({ pageProps, Component }) {
    const currentUser = useMe() // calls getMe() on the server
    return (
        <div>
            <Component {...pageProps} />
            <OptInProvider
                serviceId="cm0plu1gk0001148XXXXX"
                userId={currentUser.email}
                userProperties={currentUser.signedUserProperties}
            />
        </div>
    )
}

export default function App({ Component, pageProps }) {
    return (
        <SomeOtherProvider>
            <AppContent Component={Component} pageProps={pageProps} />
        </SomeOtherProvider>
    )
}
```