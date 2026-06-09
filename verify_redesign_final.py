import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 2000})

        # Base URL
        base_url = "http://localhost:5173"

        # 1. Landing Page
        await page.goto(base_url)
        await asyncio.sleep(2)
        await page.screenshot(path="1_landing_redesign.png", full_page=True)
        print("Captured 1_landing_redesign.png")

        # 2. Dashboard
        await page.click("text=Start Studying Free")
        await asyncio.sleep(2)
        await page.screenshot(path="2_dashboard_redesign.png", full_page=True)
        print("Captured 2_dashboard_redesign.png")

        # 3. Capsules Page
        await page.click("button[title='Caps']")
        await asyncio.sleep(2)

        # Generate a capsule
        await page.fill("textarea", "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.")
        # Using "Synthesize" as the button text from the code
        await page.click("button:has-text('Synthesize')")
        await asyncio.sleep(4) # Wait for animation
        await page.screenshot(path="3_capsules_generated.png", full_page=True)
        print("Captured 3_capsules_generated.png")

        # 4. Mobile View
        mobile_page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await mobile_page.goto(base_url)
        await mobile_page.click("text=Start Studying Free")
        await asyncio.sleep(2)
        await mobile_page.screenshot(path="4_mobile_dashboard.png")
        print("Captured 4_mobile_dashboard.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
