import type { NextApiRequest, NextApiResponse } from 'next';

const activities = [
  { id: 1, name: "Durva D", amount: "1000", type: "sent", time: "2 hours ago" },
  { id: 2, name: "Aditya N", amount: "50", type: "received", time: "5 hours ago" },
  { id: 3, name: "Sangram K", amount: "200", type: "sent", time: "Yesterday" },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(activities);
}
