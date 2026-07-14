import { useState } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";

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
    type: string;
    title?: string;
    status?: string;
    result?: string;
    notes?: string;
    owner?: string;
    start_time?: string;
    end_time?: string;
  }[];
  onView?: (name: string, type: string) => void;
};

export function LeadFollowupDetails({ title, subheader, list, onView }: Props) {
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
                <TableCell>Date & Time</TableCell>

                <TableCell>Type</TableCell>

                <TableCell>Title</TableCell>

                <TableCell>Status</TableCell>
                
                <TableCell>Completed Status</TableCell>

                <TableCell>Owner</TableCell>

                <TableCell>Notes</TableCell>

                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box
                      sx={{
                        py: 8,
                      }}
                    >
                      <Iconify
                        icon={"solar:calendar-mark-bold-duotone" as any}
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
                        No follow-up history available
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedList.map((row) => (
                  <TableRow hover key={row.name}>
                    <TableCell>
                      {row.start_time ? fDateTime(row.start_time) : "-"}
                    </TableCell>

                    <TableCell>
                      <Label color={row.type === "Call" ? "primary" : "info"}>
                        {row.type}
                      </Label>
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 250,
                        fontWeight: 600,
                      }}
                    >
                      {row.title || "-"}
                    </TableCell>

                    <TableCell>
                      <Label
                        color={
                          row.status === "Completed" ? "success" : "warning"
                        }
                      >
                        {row.status || "-"}
                      </Label>
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 150,
                      }}
                    >
                      {row.result || "-"}
                    </TableCell>

                    <TableCell>{row.owner || "-"}</TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 300,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {row.notes || "-"}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        onClick={() => onView?.(row.name, row.type)}
                        sx={{ color: "info.main" }}
                        title="View"
                      >
                        <Iconify icon="solar:eye-bold" />
                      </IconButton>
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
