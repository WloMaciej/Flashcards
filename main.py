from pypdf import PdfReader


file = open("originalsB!.txt", mode="w",encoding="utf-8")
file2 = open("Translations.txt", mode="w",encoding="utf-8")
file3 = open("removed.txt", mode="w",encoding="utf-8")
reader = PdfReader("Goethe-Zertifikat_B1_Wortliste.pdf")


def visitor_body(text, cm, tm, font_dict, font_size):
    global entry
    global previousY
    y = tm[5]
    x = tm[4]
    if 30 > y or y > 800:
        return
    elif x < 35 or (100 < x < 300) or x > 400:
        return
    if 300 < x < 400:
        if previousY - y > 12 or previousY - y < -1:
            parts.append(entry)
            entry = text
        else:
            entry += text

        # parts.append(text)
    elif 35 < x < 100:
        if previousY - y > 12 or previousY - y < -1:
            parts.append(entry)
            entry = text
        else:
            entry += text
        # parts.append(text)
    previousY = y

originals = []
removed = []
toBeTranslated = []

for p in range(15, 102):
    parts = []
    entry = ""
    previousY = False
    page = reader.pages[p]
    page.extract_text(visitor_text=visitor_body)
    parts.append(entry)
    # print(len(words))
    # file.write("".join(parts))
    # print(parts)
    for part in parts:
        part = part.replace("\n", " ")
        if part[:-1].endswith("-") and part[:-1].find(" ") < 0:
            removed.append(part)
        else:
            originals.append(part)
            i = part.find(",")
            j = part.find(" (")
            if i > 0 and j > 0:
                toBeTranslated.append(part[:min(i, j)])
            elif i > 0 or j > 0:
                toBeTranslated.append(part[:max(i, j)])
            else:
                toBeTranslated.append(part)

    # if i:
    #     print(part)
originals = [i + "\n" for i in originals if len(i) > 2]
toBeTranslated = [i + "\n" for i in toBeTranslated if len(i) != 2]
removed = [i + "\n" for i in removed if len(i) != 2]



file.write("".join(originals))
file2.write("".join(toBeTranslated))
file3.write("".join(removed))


file.close()
file2.close()
file3.close()