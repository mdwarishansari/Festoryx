import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "registrations";
    const eventId = searchParams.get("eventId");
    const paymentStatus = searchParams.get("paymentStatus");

    if (type === "platform") {
      // 1. Fetch Organizations
      const organizations = await prisma.organization.findMany({
        orderBy: { createdAt: "desc" },
      });
      const orgRows = organizations.map((org) => ({
        "Organization ID": org.id,
        "Name": org.name,
        "Slug": org.slug,
        "Type": org.type,
        "Email": org.email,
        "Phone": org.phone,
        "State": org.state,
        "City": org.city,
        "Description": org.description || "",
        "Status": org.status,
        "Website": org.websiteUrl || "",
        "Created At": org.createdAt.toLocaleString("en-IN"),
      }));

      // 2. Fetch Events
      const events = await prisma.event.findMany({
        include: { organization: true },
        orderBy: { createdAt: "desc" },
      });
      const eventRows = events.map((evt) => ({
        "Event ID": evt.id,
        "Name": evt.name,
        "Slug": evt.slug,
        "Host Organization": evt.organization.name,
        "Participation Type": evt.participationType,
        "Min Team Size": evt.minTeamSize,
        "Max Team Size": evt.maxTeamSize,
        "Venue": evt.venue || "",
        "Event Date": evt.eventDate ? evt.eventDate.toLocaleString("en-IN") : "",
        "Registration Fee": evt.registrationFee ? Number(evt.registrationFee) : 0,
        "Prize Details": evt.prizeDetails || "",
        "Status": evt.status,
        "Published Globally": evt.isPublished ? "Yes" : "No",
        "Show on Homepage": evt.showOnHomepage ? "Yes" : "No",
        "Created At": evt.createdAt.toLocaleString("en-IN"),
      }));

      // 3. Fetch Registrations
      const registrations = await prisma.registration.findMany({
        include: {
          event: {
            include: { organization: true },
          },
          teamMembers: true,
        },
        orderBy: { createdAt: "desc" },
      });
      const regRows = registrations.map((reg) => ({
        "Registration ID": reg.registrationId,
        "Participant Name": reg.participantName,
        "Email": reg.email,
        "Phone": reg.phone,
        "College Name": reg.collegeName,
        "Host Organization": reg.event.organization.name,
        "Event": reg.event.name,
        "Team Name": reg.teamName || "",
        "Team Members": reg.teamMembers.map((m) => m.name).join(", "),
        "Payment Status": reg.paymentStatus,
        "UTR/Reference": reg.paymentReference || "",
        "Screenshot Link": reg.paymentScreenshot || "",
        "Status": reg.status,
        "Registered At": reg.createdAt.toLocaleString("en-IN"),
      }));

      // 4. Fetch Submissions
      const submissions = await prisma.submission.findMany({
        include: {
          registration: {
            include: {
              event: {
                include: { organization: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      const subRows = submissions.map((sub) => ({
        "Submission ID": sub.id,
        "Registration ID": sub.registration.registrationId,
        "Participant Name": sub.participantName,
        "Email": sub.email,
        "Host Organization": sub.registration.event.organization.name,
        "Event": sub.registration.event.name,
        "Project Link": sub.projectLink,
        "Submitted At": sub.createdAt.toLocaleString("en-IN"),
      }));

      // 5. Fetch Winners
      const eventsWithWinners = await prisma.event.findMany({
        where: {
          OR: [
            { winner1Id: { not: null } },
            { winner2Id: { not: null } },
            { winner3Id: { not: null } },
          ],
        },
        include: {
          organization: true,
          winner1: true,
          winner2: true,
          winner3: true,
        },
        orderBy: { createdAt: "desc" },
      });
      const winnerRows = eventsWithWinners.map((evt) => ({
        "Event ID": evt.id,
        "Event Name": evt.name,
        "Host Organization": evt.organization.name,
        "First Place Winner": evt.winner1
          ? `${evt.winner1.participantName} (${evt.winner1.registrationId})`
          : "",
        "Second Place Winner": evt.winner2
          ? `${evt.winner2.participantName} (${evt.winner2.registrationId})`
          : "",
        "Third Place Winner": evt.winner3
          ? `${evt.winner3.participantName} (${evt.winner3.registrationId})`
          : "",
        "Prize Details": evt.prizeDetails || "",
      }));

      // 6. Fetch Contact Messages (Public Inbox)
      const contactMessages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
      });
      const contactRows = contactMessages.map((cm) => ({
        "Message ID": cm.id,
        "Name": cm.name,
        "Email": cm.email,
        "Subject": cm.subject || "",
        "Message": cm.message,
        "Read Status": cm.isRead ? "Read" : "Unread",
        "Received At": cm.createdAt.toLocaleString("en-IN"),
      }));

      // 7. Fetch Org Queries
      const orgQueries = await prisma.orgQuery.findMany({
        include: { organization: true },
        orderBy: { createdAt: "desc" },
      });
      const queryRows = orgQueries.map((oq) => ({
        "Query ID": oq.id,
        "Target Organization": oq.organization.name,
        "Name": oq.name,
        "Email": oq.email,
        "Subject": oq.subject,
        "Message": oq.message,
        "Status": oq.status,
        "Received At": oq.createdAt.toLocaleString("en-IN"),
      }));

      // 8. Fetch Users
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });
      const userRows = users.map((user) => ({
        "User ID": user.id,
        "Clerk ID": user.clerkId,
        "Name": user.name,
        "Email": user.email,
        "Role": user.role,
        "Created At": user.createdAt.toLocaleString("en-IN"),
      }));

      // 9. Fetch Audit Logs
      const auditLogs = await prisma.auditLog.findMany({
        include: {
          user: true,
          organization: true,
        },
        orderBy: { createdAt: "desc" },
      });
      const logRows = auditLogs.map((al) => ({
        "Log ID": al.id,
        "User Email": al.user ? al.user.email : "",
        "User Name": al.user ? al.user.name : "",
        "Organization": al.organization ? al.organization.name : "",
        "Action": al.action,
        "Entity Type": al.entityType || "",
        "Entity ID": al.entityId || "",
        "Details": al.details ? JSON.stringify(al.details) : "",
        "Created At": al.createdAt.toLocaleString("en-IN"),
      }));

      // Create sheetjs workbook
      const workbook = XLSX.utils.book_new();

      const addSheet = (data: any[], sheetName: string) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        if (data.length > 0) {
          const maxLengths = data.reduce((acc: any, row: any) => {
            Object.keys(row).forEach((key) => {
              const valStr = String(row[key] || "");
              acc[key] = Math.max(acc[key] || 10, valStr.length, key.length);
            });
            return acc;
          }, {});
          worksheet["!cols"] = Object.keys(maxLengths).map((key) => ({
            wch: maxLengths[key] + 3,
          }));
        }
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      };

      addSheet(orgRows, "Organizations");
      addSheet(eventRows, "Events");
      addSheet(regRows, "Registrations");
      addSheet(subRows, "Submissions");
      addSheet(winnerRows, "Winners");
      addSheet(contactRows, "Public Inbox");
      addSheet(queryRows, "Org Queries");
      addSheet(userRows, "Users");
      addSheet(logRows, "Audit Logs");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Disposition": 'attachment; filename="festoryx-full-platform.xlsx"',
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    }

    if (type === "submissions") {
      const subWhere: any = {};
      if (eventId && eventId !== "ALL") {
        subWhere.registration = { eventId };
      }

      const submissions = await prisma.submission.findMany({
        where: subWhere,
        include: {
          registration: {
            include: {
              event: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const rows = submissions.map((sub) => ({
        "Submission ID": sub.id,
        "Registration ID": sub.registration.registrationId,
        "Participant Name": sub.participantName,
        "Email": sub.email,
        "Phone": sub.registration.phone,
        "College": sub.registration.collegeName,
        "Event": sub.registration.event.name,
        "Team/Solo": sub.registration.teamName ? `Team: ${sub.registration.teamName}` : "Solo",
        "Project Link": sub.projectLink,
        "Submitted At": sub.createdAt.toLocaleString("en-IN"),
      }));

      // Create SheetJS workbook
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");

      // Set column widths automatically
      const maxLengths = rows.reduce((acc: any, row: any) => {
        Object.keys(row).forEach((key) => {
          const valStr = String(row[key]);
          acc[key] = Math.max(acc[key] || 10, valStr.length, key.length);
        });
        return acc;
      }, {});
      
      worksheet["!cols"] = Object.keys(maxLengths).map((key) => ({
        wch: maxLengths[key] + 3,
      }));

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Disposition": 'attachment; filename="festoryx-submissions.xlsx"',
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    }

    // Default: Registrations
    const where: any = {};
    if (eventId && eventId !== "ALL") {
      where.eventId = eventId;
    }
    if (paymentStatus && paymentStatus !== "ALL") {
      where.paymentStatus = paymentStatus;
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        event: true,
        teamMembers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Flatten registrations list into flat Excel rows
    const rows = registrations.map((reg) => ({
      "Registration ID": reg.registrationId,
      "Participant Name": reg.participantName,
      "Email": reg.email,
      "Phone": reg.phone,
      "College Name": reg.collegeName,
      "Department": reg.department || "",
      "Year/Semester": reg.yearOrSemester || "",
      "Event": reg.event.name,
      "Team Name": reg.teamName || "",
      "Team Members": reg.teamMembers.map((m) => m.name).join(", "),
      "Payment Status": reg.paymentStatus,
      "UTR/Reference": reg.paymentReference || "",
      "Screenshot Link": reg.paymentScreenshot || "",
      "Status": reg.status,
      "Registered At": reg.createdAt.toLocaleString("en-IN"),
    }));

    // Create SheetJS workbook
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    // Set column widths automatically
    const maxLengths = rows.reduce((acc: any, row: any) => {
      Object.keys(row).forEach((key) => {
        const valStr = String(row[key]);
        acc[key] = Math.max(acc[key] || 10, valStr.length, key.length);
      });
      return acc;
    }, {});
    
    worksheet["!cols"] = Object.keys(maxLengths).map((key) => ({
      wch: maxLengths[key] + 3,
    }));

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="festoryx-registrations.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export registrations API error:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel download" },
      { status: 500 }
    );
  }
}
