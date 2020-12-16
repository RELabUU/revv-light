# REVV-Light tool

> Ambiguity and Incompleteness in User Story Requirements

This program extracts concepts and relationships from a User Story HTML report file obtained from the visual-narrator-adapted-for-revv tool and converts it into an interactive visualization that can be utilized for identifying terminological ambiguity and incompleteness in user story requirements.

## Installing
For this tool to run you either need a local or hosted web server that supports PHP and has write permissions. Upload the content of this folder to the root of the web server. Open the tool by visiting the url of the root in the web browser.

## Creating a visualization:
1. Use the visual-narrator-adapted-for-revv tool (https://github.com/RELabUU/visual-narrator-adapted-for-revv) to create an HTML report from a set of user stories.
2. Open the REVV-Light tool in the browser.
3. Select 'Choose a file' and upload the HTML report. Note it may take a few minutes for converting the HTML file into a REVV-Light visualization.
4. Visit the link that is returned by the REVV tool.

## References
This tool has been used in the context of the following paper: Fabiano Dalpiaz, Ivor van der Schalk, Sjaak Brinkkemper, Fatma Başak Aydemir, Garm Lucassen. Detecting Terminological Ambiguity in User Stories: Tool and Experimentation. Information & Software Technology (110), pp 3--16, 2019 [pdf](https://webspace.science.uu.nl/~dalpi001/papers/dalp-scha-brin-ayde-luca-19-ist.pdf)
