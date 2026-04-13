// ===== LIST VIEW CUSTOMIZATION FOR FINANCE VIEWER =====
$(document).ready(function() {
    // Wait for frappe and user roles to be available
    var waitForFrappe = setInterval(function() {
        if (window.frappe && frappe.user_roles && frappe.user_roles.length > 0) {
            clearInterval(waitForFrappe);

            if (!frappe.user_roles.includes('Finance Viewer')) {
//                console.log('Not Finance Viewer, skipping list customization');
                return;
            }

  //          console.log('Finance Viewer detected - setting up list customization');

            // Setup Purchase Invoice list settings
            frappe.listview_settings = frappe.listview_settings || {};
            frappe.listview_settings['Purchase Invoice'] = frappe.listview_settings['Purchase Invoice'] || {};

            frappe.listview_settings['Purchase Invoice'].onload = function(listview) {
    //            console.log('Purchase Invoice list onload triggered');
                setTimeout(hideListColumns, 500);
            };


            // Check if already on Purchase Invoice list
            checkAndHideColumns();
        }
    }, 100);

    // Stop checking after 10 seconds
    setTimeout(function() { clearInterval(waitForFrappe); }, 10000);
});

// Also check on every page change
$(document).on('page-change', function() {
    if (frappe.user_roles && frappe.user_roles.includes('Finance Viewer')) {
        checkAndHideColumns();
    }
});

function checkAndHideColumns() {
    var route = frappe.get_route();
    if (route && route[0] === 'List' && route[1] === 'Purchase Invoice') {
      //  console.log('On Purchase Invoice list page');
        setTimeout(hideListColumns, 1000);
    }
}

function hideListColumns() {
    //console.log('=== hideListColumns called ===');

    // Find the header row
    var header = $('.list-row-head');
    if (!header.length) {
        //console.log('No header found');
        return;
    }

    var columnsToHide = ['Status', 'Date'];
    var indicesToHide = [];

    // Find column indices by span text in header
    header.find('.list-row-col').each(function(idx) {
        var columnText = $(this).find('span').text().trim();
        //console.log('Column', idx, ':', columnText);

        if (columnsToHide.includes(columnText)) {
            indicesToHide.push(idx);
           // console.log('Will hide column:', columnText, 'at index:', idx);

            // Hide this header column
            $(this).hide();
        }
    });

    // Hide corresponding columns in all data rows
    $('.list-row').each(function() {
        var $row = $(this);
        indicesToHide.forEach(function(colIdx) {
            $row.find('.list-row-col').eq(colIdx).hide();
        });
    });

    // Also add CSS rule for any new rows that get loaded
    if (!$('#finance-viewer-list-styles').length) {
        // Calculate nth-child positions (add 1 because nth-child is 1-indexed)
        var cssRules = indicesToHide.map(function(idx) {
            var position = idx + 1;
            return `.list-row-head .list-row-col:nth-child(${position}), .list-row .list-row-col:nth-child(${position})`;
        }).join(', ');

        $('head').append(`
            <style id="finance-viewer-list-styles">
                ${cssRules} {
                    display: none !important;
                }
            </style>
        `);
       // console.log('Added CSS rules:', cssRules);
    }

     //console.log('Hiding complete. Hid', indicesToHide.length, 'columns');
}

$(document).on('page-change', function() {
    setTimeout(function() {
        if (window.frappe && frappe.query_report) {

            // Export blocking (existing code)
            if (!frappe.query_report._override_applied && frappe.query_report.export_report) {
                frappe.query_report.original_export_report = frappe.query_report.export_report;

	    	frappe.query_report.export_report = function() {
                    return frappe.query_report.original_export_report.apply(this, arguments);
                };

                frappe.query_report._override_applied = true;
            }

            // NEW: Hide columns for Finance Viewer on Trial Balance
            if (frappe.user_roles && frappe.user_roles.includes('Finance Viewer')) {
                var route = frappe.get_route();

                if (route[0] === 'query-report' && route[1] === 'Trial Balance') {
                    // Wait for datatable to load
                    var checkDataTable = setInterval(function() {
                        if (frappe.query_report && frappe.query_report.datatable) {
                            clearInterval(checkDataTable);
                            hideColumns();
                        }
                    }, 200);

		 // Stop checking after 5 seconds
                    setTimeout(function() {
                        clearInterval(checkDataTable);
                    }, 5000);
                }
            }

      //      console.log('Export control activated');
        }

            // NEW: Purchase Invoice List View customization for Finance Viewer
        if (frappe.user_roles && frappe.user_roles.includes('Finance Viewer')) {
            var route = frappe.get_route();

            if (route[0] === 'List' && route[1] === 'Purchase Invoice') {
                customizePurchaseInvoiceList();
            }
        }
    }, 500);
});

function hideColumns() {
    var columns_to_hide = ['Opening (Dr)', 'Opening (Cr)', 'Debit', 'Credit'];

    // Get all columns
    var columns = frappe.query_report.datatable.datamanager.columns;

    columns.forEach(function(col, idx) {
        var col_label = col.content || col.label || col.name;

        if (columns_to_hide.includes(col_label)) {
            // Hide using CSS (most reliable)
            $('.dt-cell--col-' + idx).hide();
            $('.dt-cell[data-col-index="' + idx + '"]').hide();

            // Also try datatable API
            try {
                frappe.query_report.datatable.columnmanager.hideColumn(idx);
            } catch(e) {
        //        console.log('Could not hide column via API:', col_label);
            }
        }
    });

   // console.log('Hidden columns for Finance Viewer on Trial Balance');
}

// NEW: Purchase Invoice list customization
function customizePurchaseInvoiceList() {
    // Wait for list view to load
    var checkListView = setInterval(function() {
        if (cur_list && cur_list.page) {
            clearInterval(checkListView);

            // Modify list settings
            if (cur_list.settings) {
                // Remove status and posting_date from fields
                var fields_to_remove = ['status', 'posting_date'];

                if (cur_list.settings.fields) {
                    cur_list.settings.fields = cur_list.settings.fields.filter(function(field) {
                        return !fields_to_remove.includes(field);
                    });
                }

                // Add taxes_and_charges_added field
                if (cur_list.settings.fields && !cur_list.settings.fields.includes('taxes_and_charges_added')) {
                    cur_list.settings.fields.push('taxes_and_charges_added');
                }

                // Refresh the list to apply changes
                cur_list.refresh();

		   //           console.log('Purchase Invoice list customized for Finance Viewer');
            }
        }
    }, 200);

    setTimeout(function() {
        clearInterval(checkListView);
    }, 5000);
}
