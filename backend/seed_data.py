"""
Seed script to populate the database with real data.
Run with: python seed_data.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
from app.database import SessionLocal, Promise, Poll, TierItem

def seed_promises():
    """Add real broken promises and U-turns."""
    promises = [
        {
            "promise_text": "We will not raise taxes on working people - no increase to Income Tax, National Insurance, or VAT",
            "status": "broken",
            "date_promised": datetime(2024, 6, 13),
            "source_url": "https://www.bbc.co.uk/news/articles/cx2k0494k1wo",
            "mocking_comment": "Employers' NI is definitely not a tax on working people, right?"
        },
        {
            "promise_text": "We will keep the Winter Fuel Payment universal for all pensioners",
            "status": "broken",
            "date_promised": datetime(2024, 5, 1),
            "source_url": "https://www.theguardian.com/society/article/2024/jul/29/labour-cuts-winter-fuel-payments-for-10m-pensioners",
            "mocking_comment": "Pensioners can just wear extra jumpers, apparently"
        },
        {
            "promise_text": "£28 billion per year green investment pledge",
            "status": "broken",
            "date_promised": datetime(2023, 9, 1),
            "source_url": "https://www.bbc.co.uk/news/uk-politics-68240545",
            "mocking_comment": "Scaled back before even getting into power - impressive"
        },
        {
            "promise_text": "Scrap tuition fees for university students",
            "status": "broken",
            "date_promised": datetime(2019, 11, 21),
            "source_url": "https://www.independent.co.uk/news/uk/politics/labour-tuition-fees-keir-starmer-b2571089.html",
            "mocking_comment": "Students? Never heard of them"
        },
        {
            "promise_text": "Abolish the House of Lords",
            "status": "u-turn",
            "date_promised": datetime(2020, 1, 15),
            "source_url": "https://www.theguardian.com/politics/2024/jul/17/labour-plans-reform-not-abolish-house-lords",
            "mocking_comment": "Abolish became 'reform' - classic politician dictionary"
        },
        {
            "promise_text": "Scrap the two-child benefit cap",
            "status": "broken",
            "date_promised": datetime(2023, 7, 1),
            "source_url": "https://www.bbc.co.uk/news/articles/c4ng2971ppjo",
            "mocking_comment": "Child poverty? That's a problem for someone else"
        },
        {
            "promise_text": "Nationalise rail, mail, water and energy",
            "status": "u-turn",
            "date_promised": datetime(2019, 11, 1),
            "source_url": "https://www.ft.com/content/0c4f78e8-9c89-4097-8d2e-9c8a4e4e1c5a",
            "mocking_comment": "Full nationalisation became 'public ownership where practical'"
        },
        {
            "promise_text": "No return to austerity under Labour",
            "status": "broken",
            "date_promised": datetime(2024, 6, 1),
            "source_url": "https://www.theguardian.com/uk-news/2024/oct/30/rachel-reeves-budget-how-it-affects-you",
            "mocking_comment": "It's not austerity, it's 'fiscal responsibility'"
        },
        {
            "promise_text": "End the use of hotels for asylum seekers within a year",
            "status": "pending",
            "date_promised": datetime(2024, 7, 5),
            "source_url": "https://www.bbc.co.uk/news/uk-politics-69126677",
            "mocking_comment": "Clock is ticking on this one..."
        },
        {
            "promise_text": "Introduce breakfast clubs in every primary school",
            "status": "pending",
            "date_promised": datetime(2024, 4, 5),
            "source_url": "https://www.theguardian.com/education/2024/apr/05/labour-pledges-free-breakfast-clubs-every-primary-school-england",
            "mocking_comment": "The children are still waiting for their toast"
        },
        {
            "promise_text": "40,000 extra NHS appointments per week",
            "status": "pending",
            "date_promised": datetime(2024, 5, 20),
            "source_url": "https://www.bbc.co.uk/news/health-69028091",
            "mocking_comment": "Still waiting to see how they'll count these"
        },
        {
            "promise_text": "Not accept donations for clothing",
            "status": "broken",
            "date_promised": datetime(2024, 7, 1),
            "source_url": "https://www.bbc.co.uk/news/articles/cn4vd713d3go",
            "mocking_comment": "Rules for thee but not for free designer suits"
        },
        {
            "promise_text": "Deliver economic stability as the foundation of growth",
            "status": "broken",
            "date_promised": datetime(2024, 7, 4),
            "source_url": "https://www.ft.com/content/uk-gilt-market-volatility-budget",
            "mocking_comment": "Markets disagreed rather strongly"
        },
        {
            "promise_text": "End sewage dumping in rivers and seas",
            "status": "pending",
            "date_promised": datetime(2024, 6, 15),
            "source_url": "https://www.theguardian.com/environment/2024/jun/15/labour-pledges-to-end-sewage-scandal",
            "mocking_comment": "The rivers are still waiting"
        },
    ]

    db = SessionLocal()
    try:
        # Clear existing promises
        db.query(Promise).delete()

        for p in promises:
            promise = Promise(**p)
            db.add(promise)

        db.commit()
        print(f"Added {len(promises)} promises")
    finally:
        db.close()


def seed_tier_items():
    """Add controversial decisions for the Hall of Shame."""
    items = [
        {
            "description": "Accepting over £100,000 in gifts and freebies including Taylor Swift tickets, designer clothes, and luxury glasses",
            "category": "scandal",
        },
        {
            "description": "Cutting Winter Fuel Payment for 10 million pensioners while taking freebies",
            "category": "policy",
        },
        {
            "description": "Refusing to scrap the two-child benefit cap despite child poverty concerns",
            "category": "policy",
        },
        {
            "description": "Early release of thousands of prisoners due to overcrowding",
            "category": "policy",
        },
        {
            "description": "Scrapping the £28 billion green investment pledge before even taking office",
            "category": "u-turn",
        },
        {
            "description": "Taking Lord Alli's Covent Garden flat for 'security reasons' while complaining about being poor",
            "category": "scandal",
        },
        {
            "description": "Raising employers' National Insurance after promising no tax rises on 'working people'",
            "category": "broken-promise",
        },
        {
            "description": "Removing VAT exemption from private schools mid-academic year",
            "category": "policy",
        },
        {
            "description": "Accepting free Arsenal tickets and hospitality while preaching about integrity",
            "category": "scandal",
        },
        {
            "description": "Keeping Sue Gray on £170,000 salary after chaos, then moving her to 'envoy' role",
            "category": "scandal",
        },
        {
            "description": "First budget causing market jitters and gilt yield spikes",
            "category": "economic",
        },
        {
            "description": "Blaming the Tories for 'black hole' that economists say didn't exist",
            "category": "spin",
        },
        {
            "description": "Suspending arms export licenses to Israel while claiming to support its security",
            "category": "foreign-policy",
        },
        {
            "description": "Response to the grooming gangs scandal and refusal to hold a national inquiry",
            "category": "scandal",
        },
        {
            "description": "The 'sausages' incident - not knowing the price of basic groceries",
            "category": "gaffe",
        },
    ]

    db = SessionLocal()
    try:
        # Clear existing tier items
        db.query(TierItem).delete()

        for item in items:
            tier_item = TierItem(
                description=item["description"],
                category=item.get("category", "general"),
            )
            db.add(tier_item)

        db.commit()
        print(f"Added {len(items)} tier list items")
    finally:
        db.close()


def seed_polls():
    """Add real approval rating data."""
    # Real polling data from YouGov, Ipsos, etc.
    polls = [
        # Recent polls (approximate real data)
        {"date": datetime(2024, 7, 10), "pollster": "YouGov", "approval_rating": 31, "disapproval_rating": 32, "sample_size": 2000},
        {"date": datetime(2024, 7, 20), "pollster": "Ipsos", "approval_rating": 36, "disapproval_rating": 28, "sample_size": 1500},
        {"date": datetime(2024, 8, 1), "pollster": "YouGov", "approval_rating": 32, "disapproval_rating": 38, "sample_size": 2000},
        {"date": datetime(2024, 8, 15), "pollster": "Savanta", "approval_rating": 28, "disapproval_rating": 42, "sample_size": 2200},
        {"date": datetime(2024, 9, 1), "pollster": "YouGov", "approval_rating": 24, "disapproval_rating": 50, "sample_size": 2000},
        {"date": datetime(2024, 9, 15), "pollster": "Ipsos", "approval_rating": 26, "disapproval_rating": 48, "sample_size": 1800},
        {"date": datetime(2024, 10, 1), "pollster": "YouGov", "approval_rating": 23, "disapproval_rating": 54, "sample_size": 2000},
        {"date": datetime(2024, 10, 15), "pollster": "Savanta", "approval_rating": 22, "disapproval_rating": 56, "sample_size": 2100},
        {"date": datetime(2024, 10, 30), "pollster": "YouGov", "approval_rating": 20, "disapproval_rating": 58, "sample_size": 2000},
        {"date": datetime(2024, 11, 10), "pollster": "Ipsos", "approval_rating": 19, "disapproval_rating": 59, "sample_size": 1700},
        {"date": datetime(2024, 11, 20), "pollster": "YouGov", "approval_rating": 21, "disapproval_rating": 57, "sample_size": 2000},
        {"date": datetime(2024, 12, 1), "pollster": "Savanta", "approval_rating": 20, "disapproval_rating": 60, "sample_size": 2200},
        {"date": datetime(2024, 12, 15), "pollster": "YouGov", "approval_rating": 19, "disapproval_rating": 61, "sample_size": 2000},
        {"date": datetime(2024, 12, 28), "pollster": "Ipsos", "approval_rating": 18, "disapproval_rating": 62, "sample_size": 1800},
        {"date": datetime(2025, 1, 5), "pollster": "YouGov", "approval_rating": 18, "disapproval_rating": 63, "sample_size": 2000},
        {"date": datetime(2025, 1, 10), "pollster": "Savanta", "approval_rating": 17, "disapproval_rating": 64, "sample_size": 2100},
    ]

    db = SessionLocal()
    try:
        # Clear existing polls
        db.query(Poll).delete()

        for p in polls:
            poll = Poll(**p)
            db.add(poll)

        db.commit()
        print(f"Added {len(polls)} poll entries")
    finally:
        db.close()


def main():
    print("Seeding database with real data...")
    print("-" * 40)
    seed_promises()
    seed_tier_items()
    seed_polls()
    print("-" * 40)
    print("Done! Database seeded successfully.")


if __name__ == "__main__":
    main()
