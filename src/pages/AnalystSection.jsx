import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

const COLORS =
  ["#0088FE", "#00C49F", "#FFBB28"];

function AnalystSection() {

  const [loanStats,
         setLoanStats] = useState([]);

  const [totalPayments,
         setTotalPayments] = useState(0);

  useEffect(() => {

    const loadStats = async () => {

      try {

        const stats =
          await apiFetch(
            "/analytics/loan-status"
          );

        const payments =
          await apiFetch(
            "/analytics/total-payments"
          );

        console.log("Stats:", stats);
        console.log("Payments:", payments);

        setLoanStats(stats);
        setTotalPayments(payments);

      } catch (error) {

        console.error(error);
        alert(error.message);
      }
    };

    loadStats();

  }, []);

  return (

    <div>

      <h2>Loan Status Overview</h2>

      <PieChart width={400} height={300}>

        <Pie
          data={loanStats}
          dataKey="count"
          nameKey="status"
          outerRadius={100}
          label
        >

          {loanStats.map(
            (entry, index) => (

            <Cell
              key={index}
              fill={
                COLORS[
                  index %
                  COLORS.length
                ]
              }
            />

          ))}

        </Pie>

        <Tooltip />
        <Legend />

      </PieChart>

      <h3>
        Total Payments:
        ₹{totalPayments}
      </h3>

    </div>
  );
}

export default AnalystSection;