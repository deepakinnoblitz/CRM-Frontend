import { useState } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import { alpha } from '@mui/material/styles';
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";

import { useRouter } from 'src/routes/hooks';

import { fDateTime } from "src/utils/format-time";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";
import { Scrollbar } from "src/components/scrollbar";

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  subheader?: string;
  list: {
    name: string;
    proposal_title: string;
    reference_no: string;
    proposal_date: string;
    valid_until?: string;
    status: string;
    lead_name?: string;
    company_name?: string;
  }[];
};

export function LeadProposalDetails({ title, subheader, list }: Props) {
  const router = useRouter();

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedList = list.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <TableContainer
          sx={{
            overflow: "unset",
            mt: 3,
          }}
        >
          <Table
            stickyHeader
            sx={{
              minWidth: 900,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Sno</TableCell>

                <TableCell>Reference No</TableCell>

                <TableCell>Proposal Title</TableCell>

                <TableCell>Proposal Date</TableCell>

                <TableCell>Valid Until</TableCell>
                
                <TableCell>Company</TableCell>

                <TableCell>Status</TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box
                      sx={{
                        py: 8,
                      }}
                    >
                      <Iconify
                        icon={"solar:document-add-bold" as any}
                        width={56}
                        sx={{
                          color: "text.disabled",
                          opacity: 0.25,
                          mb: 2,
                        }}
                      />

                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        No Proposal available for this Lead
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedList.map((row, index) => (
                  <TableRow hover key={row.name}>
                    <TableCell align="center">
                        <Box
                        sx={{
                            width: 28,
                            height: 28,
                            display: 'flex',
                            borderRadius: '50%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                            typography: 'subtitle2',
                            fontWeight: 800,
                            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                            mx: 'auto',
                            transition: (theme) => theme.transitions.create(['all'], { duration: theme.transitions.duration.shorter }),
                            '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            transform: 'scale(1.1)',
                            },
                        }}
                        >
                        {page * rowsPerPage + index + 1}
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Typography
                            onClick={() => router.push(`/proposals/${encodeURIComponent(row.name)}/view`)}
                            sx={{
                                fontWeight: 700,
                                color: 'primary.main',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                fontSize: '14px'
                            }}
                        >
                            {row.reference_no}
                        </Typography>
                    </TableCell>

                    <TableCell
                        sx={{
                            maxWidth: 250,
                            fontWeight: 600,
                        }}
                    >
                        {row.proposal_title}
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                       {row.proposal_date ? fDateTime(row.proposal_date) : "-"}
                    </TableCell>

                    <TableCell
                        sx={{
                            fontWeight: 600,
                        }}
                    >
                       {row.valid_until ? fDateTime(row.valid_until) : "-"}
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 200,
                      }}
                    >
                        {row.company_name || "-"}
                    </TableCell>

                    <TableCell>
                        <Label
                        color={
                            row.status === "Approved"
                            ? "success"
                            : row.status === "Rejected"
                            ? "error"
                            : row.status === "Sent"
                            ? "info"
                            : "warning"
                        }
                    >
                        {row.status}
                        </Label>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      {list.length > 0 && (
        <TablePagination
          component="div"
          count={list.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}
    </Card>
  );
}
