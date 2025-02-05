import { useEffect, useState } from "react";
import { apiBaseUrl, authKey } from "./utils/constants";
import toast from "react-hot-toast";
import { Button, Container, Form, Table } from "react-bootstrap";
import { updateIfValid } from "../../utils/utils";

interface Variant {
  id: number;
  value: string;
  prob: number;
}

const AdminVariants = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl + "/admin/variants", {
        headers: {
          Authorization: authKey,
        },
      });
      const data = await res.json();
      console.log(data);
      setVariants(data.variants);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVariants();
  }, []);

  const handleChange = (
    index: number,
    field: "value" | "prob",
    newValue: string
  ) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: newValue };
    setVariants(updatedVariants);
  };

  const handleSubmit = async () => {
    const body = {
      value: variants.map((v) => parseFloat(v.value)),
      probability: variants.map((v) => parseFloat(v.prob.toString())),
    };

    try {
      const res = await fetch(apiBaseUrl + "/admin/update-variants", {
        method: "POST",
        headers: {
          Authorization: authKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw (await res.json()).error;
      }
      toast.success("Variants Updated");
    } catch (error: any) {
      toast.error(error.toString());
      console.log(error);
    }
  };

  if (loading) return <p>Loading...</p>;
  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Manage Variants</h2>
      <Table bordered hover responsive>
        <thead className="text-center">
          <tr>
            <th>ID</th>
            <th>Value</th>
            <th>Probability (%)</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant, index) => (
            <tr key={variant.id}>
              <td className="text-center">{variant.id}</td>
              <td>
                <Form.Control
                  type="text"
                  value={variant.value}
                  onChange={(e) => {
                    updateIfValid(e.target.value, (value) => {
                      handleChange(index, "value", value);
                    });
                  }}
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  value={variant.prob}
                  onChange={(e) => {
                    updateIfValid(e.target.value, (value) => {
                      handleChange(index, "prob", value);
                    });
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button variant="primary" onClick={handleSubmit} className="w-100 mt-3">
        Update Variants
      </Button>
    </Container>
  );
};

export default AdminVariants;
