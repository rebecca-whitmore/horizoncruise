import Image from "next/image";
import Link from "next/link";
import alaskaHeroImage from "@/lib/images/alaska-cruise-ship.webp";
import styles from "./Homepage.module.css";

type PlaceholderProps = {
  label: string;
  size: string;
  variant?: "alaska" | "japan" | "fjords" | "ocean";
  className?: string;
};

function ImagePlaceholder({
  label,
  size,
  variant = "ocean",
  className = "",
}: PlaceholderProps) {
  return (
    <div className={`${styles.imagePlaceholder} ${styles[variant]} ${className}`}>
      <span>{label}</span>
      <small>Preferred image: {size}px</small>
    </div>
  );
}

const experiences = [
  {
    number: "01",
    title: "Alaska & the Rocky Mountaineer",
    copy: "Pair wild coastlines and glacier country with one of the world’s great rail journeys.",
    image: "Alaska landscape or train-and-mountain scene",
    variant: "alaska" as const,
  },
  {
    number: "02",
    title: "Japan cruise & stay",
    copy: "Give the cities, food and culture room to breathe before or after the sailing.",
    image: "Japan city, garden or cultural landscape",
    variant: "japan" as const,
  },
  {
    number: "03",
    title: "Norwegian fjords",
    copy: "Choose the right route, ship and time of year for landscapes that feel genuinely immense.",
    image: "Norwegian fjord and ship landscape",
    variant: "fjords" as const,
  },
];

const journeys = [
  {
    tag: "Rail & sail",
    title: "Rockies to Alaska",
    detail: "Vancouver stay · Rocky Mountaineer · Alaska cruise",
    price: "From £4,995pp",
    variant: "alaska" as const,
  },
  {
    tag: "Cruise & stay",
    title: "Tokyo, Kyoto & Japan by sea",
    detail: "Tokyo stay · Japan sailing · Kyoto extension",
    price: "From £3,849pp",
    variant: "japan" as const,
  },
  {
    tag: "Closer to home",
    title: "The Norwegian fjords",
    detail: "Sail from the UK · Scenic fjord itinerary",
    price: "From £1,299pp",
    variant: "fjords" as const,
  },
];

const articles = [
  {
    type: "Choosing well",
    title: "What makes a cruise-and-stay holiday work?",
    variant: "ocean" as const,
  },
  {
    type: "Destination guide",
    title: "How to choose between Alaska’s cruise routes",
    variant: "alaska" as const,
  },
  {
    type: "First-hand planning",
    title: "The questions worth asking before you book",
    variant: "japan" as const,
  },
];

export function Homepage() {
  return (
    <div className={styles.homepage}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/home-preview" aria-label="Horizon Cruise home preview">
          <Image src="/icon.png" width={38} height={38} alt="" priority />
          <span>Horizon Cruise</span>
        </Link>
        <nav className={styles.nav} aria-label="Homepage preview navigation">
          <a href="#experiences">Experiences</a>
          <a href="#journeys">Journeys</a>
          <a href="#why-horizon">Why Horizon</a>
          <Link href="/articles">Journal</Link>
        </nav>
        <a className={styles.headerCta} href="#enquire">Plan with us</a>
      </header>

      <main>
        <section className={styles.hero}>
          <Image
            className={styles.heroPhoto}
            src={alaskaHeroImage}
            alt="Cruise ship sailing through calm turquoise water beneath snow-capped Alaskan mountains"
            fill
            priority
            quality={88}
            sizes="100vw"
          />
          <div className={styles.heroShade} />
          <div className={styles.heroContent}>
            <p className={styles.kicker}>Cruise holidays, considered as a whole</p>
            <h1>More than a sailing.<br />A holiday worth travelling for.</h1>
            <p className={styles.heroIntro}>
              Remarkable cruises, thoughtful stays and journeys shaped around what you want to experience.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#experiences">Explore the possibilities</a>
              <a className={styles.textLinkLight} href="#journeys">See featured journeys <span>→</span></a>
            </div>
          </div>
        </section>

        <section className={styles.searchStrip} aria-label="Sailing search preview">
          <div>
            <p className={styles.kickerDark}>Already have something in mind?</p>
            <h2>Search by cruise line, ship or destination.</h2>
          </div>
          <div className={styles.searchMockup} aria-label="Search feature placeholder">
            <span>Where would you like to go?</span>
            <button type="button">Find a sailing</button>
          </div>
        </section>

        <section className={styles.section} id="experiences">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kickerDark}>Start with the experience</p>
              <h2>Journeys that stay with you</h2>
            </div>
            <p>
              The ship matters. So does where you wake up, how long you have ashore and what happens before and after you sail.
            </p>
          </div>

          <div className={styles.experienceGrid}>
            {experiences.map((experience) => (
              <article className={styles.experienceCard} key={experience.title}>
                <ImagePlaceholder
                  label={experience.image}
                  size="1600 × 1100"
                  variant={experience.variant}
                  className={styles.experienceImage}
                />
                <div className={styles.experienceCopy}>
                  <span>{experience.number}</span>
                  <h3>{experience.title}</h3>
                  <p>{experience.copy}</p>
                  <a href="#journeys">Explore this experience <span>→</span></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className={styles.tailorBanner}>
          <p className={styles.kickerGold}>Your holiday, not a template</p>
          <h2>These are starting points. We use our expertise and connections to shape the journey around you.</h2>
          <a href="#enquire">Tell us what you have in mind <span>→</span></a>
        </aside>

        <section className={`${styles.section} ${styles.altSection}`} id="journeys">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kickerDark}>Featured journeys</p>
              <h2>Ideas to make your own</h2>
            </div>
            <p>Sample journey cards for now. Live sailings, availability and pricing will follow through the API integration.</p>
          </div>

          <div className={styles.journeyGrid}>
            {journeys.map((journey) => (
              <article className={styles.journeyCard} key={journey.title}>
                <ImagePlaceholder
                  label={`${journey.title} journey photography`}
                  size="1400 × 900"
                  variant={journey.variant}
                  className={styles.journeyImage}
                />
                <div className={styles.journeyBody}>
                  <p className={styles.journeyTag}>{journey.tag}</p>
                  <h3>{journey.title}</h3>
                  <p>{journey.detail}</p>
                  <div className={styles.journeyFooter}>
                    <strong>{journey.price}</strong>
                    <a href="#enquire" aria-label={`Enquire about ${journey.title}`}>View journey →</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className={styles.priceNote}>Placeholder pricing only. Final cards will show the applicable basis, inclusions and date checked.</p>
        </section>

        <section className={styles.whySection} id="why-horizon">
          <div className={styles.whyIntro}>
            <p className={styles.kickerGold}>Why Horizon Cruise</p>
            <h2>We see the whole holiday—not just the ship.</h2>
            <p className={styles.whyLead}>
              We are enthusiasts for the details that turn a sailing into a genuinely memorable journey. The right answer is rarely just a ship name or the lowest fare.
            </p>
          </div>
          <div className={styles.whyGrid}>
            <article>
              <span>01</span>
              <h3>We start with what you want to feel and experience</h3>
              <p>Scenery, culture, food, pace, time ashore and the people you are travelling with all shape the recommendation.</p>
            </article>
            <article>
              <span>02</span>
              <h3>We connect every part of the journey</h3>
              <p>Flights, hotels, rail, transfers and thoughtful stays are considered alongside the sailing—not left as afterthoughts.</p>
            </article>
            <article>
              <span>03</span>
              <h3>We bring knowledge, curiosity and real connections</h3>
              <p>Years of cruise experience and a trusted professional network help us find the right route forward, including options beyond the obvious.</p>
            </article>
            <article>
              <span>04</span>
              <h3>We explain the fit, not just the features</h3>
              <p>You will understand who an experience suits, what is included and what to consider before taking the next step.</p>
            </article>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="journal-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kickerDark}>The Horizon journal</p>
              <h2 id="journal-heading">Ideas, insight and honest guidance</h2>
            </div>
            <Link className={styles.inlineLink} href="/articles">Read all articles <span>→</span></Link>
          </div>
          <div className={styles.articlePreviewGrid}>
            {articles.map((article) => (
              <article className={styles.articlePreview} key={article.title}>
                <ImagePlaceholder
                  label={`${article.type} article photography`}
                  size="1400 × 1000"
                  variant={article.variant}
                  className={styles.articleImage}
                />
                <p>{article.type}</p>
                <h3>{article.title}</h3>
                <Link href="/articles">Read the article →</Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.enquirySection} id="enquire">
          <div className={styles.enquiryCopy}>
            <p className={styles.kickerGold}>Start a conversation</p>
            <h2>Tell us what would make the holiday feel special.</h2>
            <p>
              You may have a particular ship or sailing in mind, or only the beginnings of an idea. Share what matters and we will help you see the possibilities.
            </p>
            <div className={styles.connectionNote}>
              <strong>A well-connected route to the right help</strong>
              <p>
                Horizon Cruise draws on an extensive network of trusted cruise professionals. Where you choose to take an enquiry forward, we will clearly identify the booking partner and the financial protection they provide.
              </p>
            </div>
          </div>

          <form className={styles.enquiryForm} aria-describedby="enquiry-prototype-note">
            <div className={styles.formRow}>
              <label>
                Name
                <input type="text" name="name" autoComplete="name" placeholder="Your name" />
              </label>
              <label>
                Email
                <input type="email" name="email" autoComplete="email" placeholder="you@example.com" />
              </label>
            </div>
            <label>
              Telephone number
              <input type="tel" name="telephone" autoComplete="tel" placeholder="Optional" />
            </label>
            <label>
              What are you considering?
              <textarea
                name="message"
                rows={6}
                placeholder="A destination, ship, cruise line, sailing date—or simply the kind of experience you would love."
              />
            </label>
            <button type="button">Send your enquiry</button>
            <p id="enquiry-prototype-note" className={styles.prototypeNote}>
              Form preview only—no information is currently submitted or stored.
            </p>
          </form>
        </section>

        <section className={styles.newsletterSection}>
          <div>
            <p className={styles.kickerGold}>A better kind of cruise email</p>
            <h2>Fresh journeys and useful perspective, sent with purpose.</h2>
            <p>Join us for inspiring ideas, thoughtful guides and sailings genuinely worth knowing about.</p>
          </div>
          <form className={styles.newsletterForm} aria-describedby="newsletter-prototype-note">
            <label className={styles.srOnly} htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" placeholder="Your email address" />
            <button type="button">Join the list</button>
            <small id="newsletter-prototype-note">Preview only—newsletter sign-up is not connected yet.</small>
          </form>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Image src="/icon.png" width={42} height={42} alt="" />
          <span>Horizon Cruise</span>
        </div>
        <p>Helping you picture the whole journey and choose with confidence.</p>
        <nav aria-label="Preview footer navigation">
          <Link href="/articles">Journal</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
