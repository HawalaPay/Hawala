import type { NextApiRequest, NextApiResponse } from 'next';

let contacts = [
  { id: 1, name: "Durva D", amount: "120", image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-5.png?raw=true" },
  { id: 2, name: "Aviraj P", amount: "50", image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-1.png?raw=true" },
  { id: 3, name: "Dhanyakumar M", amount: "200", image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-2.png?raw=true" },
  { id: 4, name: "Shivam M", amount: "75", image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-3.png?raw=true" },
  { id: 5, name: "Arjun R", amount: "150", image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-4.png?raw=true" },
  { id: 6, name: "Gargie D", amount: "50", image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-1.png?raw=true" },
  { id: 7, name: "Sohan B", amount: "200", image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-2.png?raw=true" },
  { id: 8, name: "Harsh P", amount: "75", image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-3.png?raw=true" },
];


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.status(200).json(contacts);
  } else if (req.method === "POST") {
    const { name, amount, image } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount are required." });
    }
    const newContact = {
      id: contacts.length + 1,
      name,
      amount,
      image: image || "",
    };
    contacts.push(newContact);
    res.status(201).json(newContact);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
