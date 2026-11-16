# Horizon Cruise Structured Content Plan

## Purpose

Horizon Cruise will replace reliance on Widgety with an owned, structured content system for cruise lines, ships and selected featured journeys.

WordPress will remain the private writing and content-management backend. The public website will continue to be the Next.js application deployed separately.

This plan deliberately does **not** use ordinary WordPress pages for cruise lines and ships. It also does **not** use a hybrid model in which the main content is written as an unrestricted page. Cruise information will be entered through purpose-built, labelled fields so that every record is consistent, reusable and available cleanly through the WordPress REST API.

The system is intended to support authoritative cruise content and manually curated journey ideas. It is not intended to reproduce a live cruise inventory platform.

## Agreed architecture

### WordPress

WordPress will provide:

- A structured editing interface
- Content storage and revisions
- Media management
- Publishing controls
- Relationships between cruise lines, ships and journeys
- SEO fields supplied by AIOSEO
- REST API access for the Next.js frontend

### Next.js

Next.js will provide:

- All public page layouts
- Cruise-line, ship and journey URL routes
- Responsive presentation
- Search and browsing of the owned content
- Metadata, canonical URLs and structured data
- Incremental static regeneration or webhook-based updates

### WordPress database

The existing WordPress database will be the structured database. A second database will not be introduced at this stage.

## WordPress plugin

A small, purpose-built Horizon Cruise plugin will define the content model.

The plugin should:

- Register the custom post types
- Register the relevant taxonomies
- Register or configure the structured fields
- Define relationships between records
- Expose the required information through the WordPress REST API
- Remain independent of the active WordPress theme
- Use stable field names that can be consumed safely by Next.js
- Include sensible validation for important fields

The plugin is an administrative and data-structure tool. It will not create the public website design.

## Field-editing interface

A field-management solution should provide the WordPress editing screens. ACF, Pods and Meta Box are possible candidates; the final choice should consider:

- REST API support
- Relationship fields
- Repeater or grouped fields
- Media and gallery fields
- Validation
- Editor usability
- Exportability and version control
- Licensing and ongoing cost
- Long-term maintenance

The selected field system must not lock essential Horizon Cruise data into an inaccessible proprietary format. Field definitions should be exportable or registered in code wherever practical.

## Content types

### 1. Cruise Line

Internal content type name:

`cruise_line`

Proposed public URL:

`/cruise-lines/{slug}`

Suggested fields:

- Official cruise-line name
- URL slug
- Logo
- Main image
- Short introduction
- Full brand overview
- What the line is known for
- Typical guest or who it suits
- Onboard atmosphere
- Accommodation overview
- Dining overview
- Entertainment overview
- Wellness overview
- Family offering
- Dress code
- Gratuities guidance
- Included items
- Accessibility guidance
- Useful information
- Official website URL
- Featured status
- Display order

Relationships and automatically generated information:

- Associated fleet of ships
- Related featured journeys
- Related editorial articles

### 2. Ship

Internal content type name:

`ship`

Proposed public URL:

`/ships/{slug}`

Suggested identity and classification fields:

- Official ship name
- URL slug
- Cruise line relationship
- Ship class
- Cruise type
- Launch year
- Most recent refurbishment year
- Guest capacity
- Crew capacity
- Gross tonnage
- Length
- Beam
- Deck count
- Passenger decks
- Adults-only classification
- Family suitability
- Accessibility summary

Suggested media fields:

- Main image
- Image gallery
- Exterior images
- Accommodation images
- Dining images
- Entertainment images
- Deck-plan documents or images
- Image credits and licensing notes
- Alternative text

Suggested content fields:

- Short introduction
- Full overview
- Who the ship suits
- Onboard atmosphere
- Accommodation introduction
- Accommodation categories
- Dining introduction
- Dining venues
- Entertainment introduction
- Entertainment venues
- Health and fitness introduction
- Health and fitness facilities
- Enrichment introduction
- Enrichment activities
- Family facilities
- Pools and outdoor spaces
- Useful information
- Strengths
- Considerations
- Expert summary

Repeatable items such as restaurants, accommodation categories and entertainment venues should use structured repeaters or related sub-records rather than being combined into one unstructured text field.

Relationships and automatically generated information:

- Parent cruise line
- Related featured journeys
- Related editorial articles
- Relevant destinations and experience types

### 3. Featured Journey

Internal content type name:

`featured_journey`

Proposed public URL:

`/journeys/{slug}`

Featured journeys are curated examples of holidays Horizon Cruise can arrange. They are not a complete or live inventory feed.

Suggested fields:

- Journey title
- URL slug
- Short proposition
- Main image
- Gallery
- Destination relationships
- Cruise-line relationship
- Ship relationship
- Journey type
- Suggested duration
- Suggested departure period
- Departure airport or region, when relevant
- Indicative price
- Currency
- Pricing basis
- Price checked date
- Promotion expiry date
- Availability wording
- Summary of inclusions
- Summary of exclusions
- Why the journey works
- Structured itinerary stages
- Cruise component
- Land component
- Hotel component
- Rail or touring component
- Tailoring possibilities
- Enquiry call to action
- Featured status
- Display order

Prices must be presented as indicative and should include:

- “From” wording where appropriate
- Per-person and occupancy basis
- Applicable departure or travel period
- Date the price was checked
- What is included
- An availability and price-change qualification

Expired prices should be hidden automatically or replaced with an invitation to request current options. The underlying journey page should remain available when its evergreen content is still useful.

## Taxonomies

The following shared taxonomies should be considered:

- `destination`
- `cruise_type`
- `experience_type`
- `holiday_style`
- `suitable_for`
- `departure_region`
- `travel_season`

Examples include:

- Alaska
- Japan
- Norwegian Fjords
- Mediterranean
- Ocean cruise
- River cruise
- Expedition cruise
- Cruise and stay
- Rail and cruise
- Cultural
- Wildlife
- Family
- Couples
- Solo travellers

Taxonomies should only be created where they will support useful relationships, navigation, filtering or landing pages. Near-duplicate classifications should be avoided.

## Relationships

The minimum required relationships are:

- A ship belongs to one cruise line
- A cruise line has many ships
- A featured journey may reference one cruise line and one or more ships
- Ships and journeys may use multiple destinations and experience classifications
- Articles may relate to cruise lines, ships, destinations and journeys

Relationships should use stable WordPress record IDs internally. Public links should use slugs.

## REST API requirements

All required public content must be available through the WordPress REST API.

The frontend should be able to request:

- All published cruise lines
- A cruise line by slug
- Ships belonging to a cruise line
- All published ships
- A ship by slug
- Featured journeys
- A featured journey by slug
- Relevant taxonomy terms
- Related ships, journeys and articles
- Media URLs, dimensions, credits and alternative text
- AIOSEO metadata required by the public site

API responses should use consistent field names and avoid requiring the frontend to interpret arbitrary WordPress editor markup.

Drafts, private notes and licensing notes must not be exposed publicly unless explicitly required.

## Public URL structure

Initial proposed routes:

- `/cruise-lines`
- `/cruise-lines/{line-slug}`
- `/ships`
- `/ships/{ship-slug}`
- `/journeys`
- `/journeys/{journey-slug}`

The structure should be agreed before substantial content entry begins. Slugs should remain stable after publication wherever possible.

## Next.js page behaviour

The frontend should use reusable templates for each content type.

A single ship template should determine the layout of every ship page. The content entered in WordPress will populate that template consistently.

Next.js should:

- Fetch only published content
- Handle missing fields gracefully
- Use responsive images
- Provide image fallbacks
- Generate accessible navigation and tabs where appropriate
- Provide breadcrumbs
- Create related-content sections from WordPress relationships
- Return a proper not-found page for unknown slugs
- Use incremental static regeneration or publishing webhooks
- Avoid exposing WordPress administrative or private URLs

## Search and browsing

The owned system will support browsing and filtering of Horizon Cruise content, not live inventory.

Possible filters include:

- Cruise line
- Ship
- Cruise type
- Destination
- Experience
- Suitable for

This search can help visitors discover ships, cruise lines and featured journeys. It will not claim to provide:

- Live sailing availability
- Live cabin inventory
- Real-time fares
- Every departure date
- Every itinerary from every operator

## SEO

AIOSEO remains the WordPress SEO source.

For each content type, the system must support:

- SEO title
- Meta description
- Canonical URL using the public Horizon Cruise domain
- Open Graph title, description and image
- Relevant schema
- Indexing controls

The Next.js frontend must not import a CMS-level `noindex` instruction that exists only to keep the headless WordPress site out of search.

Cruise-line, ship and journey pages should be included in the public sitemap only when they are published and intended for indexing.

## Content ownership and licensing

Horizon Cruise must have permission to use all supplied copy, logos, photographs, deck plans and documents.

The CMS should retain:

- Image source
- Copyright holder
- Usage permission or licence notes
- Required credit
- Expiry or restriction information where relevant

Cruise-line copy should not simply be copied from operator or third-party websites unless permission explicitly allows it. Horizon Cruise should develop original editorial descriptions wherever possible.

## Out of scope

The first version will not attempt to maintain:

- Complete sailing schedules
- Live prices
- Cabin-level availability
- Booking-engine functionality
- Every cruise promotion
- Automated quotes
- Supplier reservation connections
- A replacement for a commercial cruise inventory feed

These features would require a direct supplier feed, commercial data provider or dedicated inventory platform in the future.

## Recommended implementation sequence

### Phase 1: content-model prototype

1. Confirm the field-management solution.
2. Create the Horizon Cruise WordPress plugin.
3. Register Cruise Line, Ship and Featured Journey.
4. Register the first essential taxonomies.
5. Build structured field groups.
6. Expose the fields and relationships through REST.
7. Add one cruise line and two or three ships as realistic test records.

Recommended prototype content:

- Celebrity Cruises
- Celebrity Edge
- Two additional Celebrity ships
- One featured journey connected to Celebrity Edge

### Phase 2: frontend templates

1. Build the cruise-line index and detail templates.
2. Build the ship index and detail templates.
3. Build the featured-journey index and sales-page template.
4. Connect AIOSEO metadata.
5. Add breadcrumbs, related content and enquiry calls to action.
6. Test mobile, tablet and desktop layouts.

### Phase 3: editorial workflow

1. Refine the editing labels and instructions.
2. Confirm required and optional fields.
3. Add validation and safe fallbacks.
4. Document image dimensions and licensing requirements.
5. Establish a price-review and journey-expiry process.

### Phase 4: expansion

1. Add further cruise lines and fleets.
2. Add destination and experience landing pages.
3. Add owned-content search and filtering.
4. Add further curated journeys.
5. Review whether future traffic or enquiry volume justifies a commercial live-data integration.

## Initial decisions required

Before implementation begins, confirm:

1. Which field-management system will be used.
2. Whether repeated items will use repeaters or related child records.
3. The final public URL structure.
4. The first cruise line and ships for the prototype.
5. Which fields are mandatory for publication.
6. The source and licensing status of initial images, logos and deck plans.
7. How AIOSEO exposes metadata for the new custom post types through REST.

## Definition of success

The first implementation is successful when:

- A non-developer can create and update cruise-line, ship and journey records in WordPress.
- Every record uses a consistent editing structure.
- Relationships work without entering the same information repeatedly.
- The REST API returns clean, predictable data.
- Next.js can render polished reusable pages from that data.
- Public URLs and SEO metadata use `horizoncruise.co.uk`.
- No Widgety API or widget is required for the owned cruise-line, ship and featured-journey content.
- The system remains manageable as more cruise lines and ships are added.
