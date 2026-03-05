# Modifications required

## Body text - Font Size and Type
Everywhere, except before the "Chart of the Week" section, the font size, weight and family is seemingly different when the HTML code is generated from the index.html file. 

## Market Watch
The color of the NASDAQ 1W% is stuck to being red, even when the value is positive. It should be green when the value is positive and red when the value is negative. The color of NASDAQ 1M% is stuck to being green, even when the value is negative. It should be green when the value is positive and red when the value is negative.

## Expert's Opinion
We have to add a UI component to build this piece as well. This is present in the HTML that gets generated via the index.html tool, by default and as a hard coded value. We want to change the content based on our requirements. The following fields are a part of this section:
- Heading of the section (eg. Q&A with S Naren, CIO at ICICI), in italics with the same fontstyle and weight as we have defined in the css
- Questions 1 (in gold as defined in the css)
- Answer 1 (Entire answer enclosed in double quotes)
- Question 2 (in gold as defined in the css)
- Answer 2 (Entire answer enclosed in double quotes)

## Weekly Reading List
The issue in the current implementation (as done in index.html) is that even after updating the "Title" and "Description" for both the links, the content is not getting updated as is reverting to some hardcoded value somewhere. 

Hardcoded or default value are as follows:
1. 
Title : ➤ Union Budget 2026 Key Highlights: What You Need to Know
Description : The article describes how the Union Budget 2026-27 aims to sustain growth with record capital expenditure, stronger support for MSMEs, strategic high-potential sectors like semiconductors and biopharma, and infrastructure initiatives that go beyond incremental tweaks to build long-term capacity and competitiveness.

2. Title: ➤ Hope and uncertainty as India and US strike long-delayed trade deal
Description: The article outlines a new India–U.S. trade agreement that slashes U.S. tariffs on Indian exports and opens market access while allowing India to protect sensitive sectors and expand purchases of U.S. goods, positioning the deal as a step toward deeper economic engagement rather than a return to old tariff disputes.