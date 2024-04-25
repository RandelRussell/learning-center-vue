<script>
import {TutorialsApiService} from "../services/tutorials-api.service.js";
import {FilterMatchMode} from "primevue/api";
import TutorialCatalogueItemDeleteConfirmationDialog
  from "../components/tutorial-item-delete-confirmation-dialog.component.vue";
import TutorialSubsetDeleteConfirmationDialog
  from "../components/tutorial-subset-delete-confirmation-dialog.component.vue";
import {Tutorial} from "../model/tutorial.entity.js";
import TutorialItemCreateAndEditDialog from "../components/tutorial-item-create-and-edit-dialog.component.vue";

export default {
  name: "tutorial-list",
  title: "Tutorials",
  components: {
    TutorialItemCreateAndEditDialog,
    TutorialSubsetDeleteConfirmationDialog,
    TutorialCatalogueItemDeleteConfirmationDialog
  },
  data() {
    return {
      title: "Tutorials",
      tutorials: [],
      tutorialDialog: false,
      deleteTutorialDialog: false,
      deleteTutorialsDialog: false,
      tutorial: null,
      selectedTutorials: null,
      filters: {},
      submitted: false,
      statuses: [
        {label: "Published", value: "published"},
        {label: "Unpublished", value: "unpublished"},
      ],
      tutorialsService: null,
    }
  },
  created() {
    this.tutorialsService = new TutorialsApiService();
    this.tutorialsService.getAll()
        .then(response => {
          this.tutorials = response.data;
          this.tutorials = this.tutorials.map(tutorial => {
            return Tutorial.toDisplayableTutorial(tutorial);
          });
        });
    this.initFilters();
  },

  methods: {

    //#region Helper Methods

    notifySuccessfulAction(message) {
      this.$toast.add({severity: "success", summary: "Success", detail: message, life: 3000,});
    },

    findIndexById(id) {
      return this.tutorials.findIndex((tutorial) => tutorial.id === id);
    },

    initFilters() {
      this.filters = {global: {value: null, matchMode: FilterMatchMode.CONTAINS}};
    },

    getSeverity(status) {
      switch (status) {
        case 'Published': return 'success';
        case 'Unpublished': return 'info';
        default:  return null;
      }
    },

    //#endregion Helper Methods

    //#region Event Handlers

    onDeleteItemConfirm() {
      this.deleteTutorial();
    },

    onDeleteItemCancel() {
      this.deleteTutorialDialog = false;
    },

    onDeleteSubsetConfirm() {
      this.deleteSelectedTutorials();
    },

    onDeleteSubsetCancel() {
      this.deleteTutorialsDialog = false;
    },

    onNewItem() {
      this.tutorial = {};
      this.submitted = false;
      this.tutorialDialog = true;
    },

    onAddOrUpdateItemCancel() {
      this.tutorialDialog = false;
      this.submitted = false;
    },

    onSaveItem() {
      this.submitted = true;
      if (this.tutorial.title.trim()) {
        if (this.tutorial.id) {
          this.updateTutorial();
        } else {
          this.createTutorial();
        }
        this.tutorialDialog = false;
        this.tutorial = {};
      }

    },

    onEditItemRequested(tutorial) {
      this.tutorial = {...tutorial};
      this.tutorialDialog = true;
    },

    onDeleteItemRequested(tutorial) {
      this.tutorial = tutorial;
      this.deleteTutorialDialog = true;
    },

    onExportRequested() {
      this.$refs.dt.exportCSV();
    },

    onConfirmDeleteSelected() {
      this.deleteTutorialsDialog = true;
    },

    //#endregion Event Handlers

    //#region Data Actions

    createTutorial() {
      this.tutorial.id = 0;
      this.tutorial = Tutorial.fromDisplayableTutorial(this.tutorial);
      this.tutorialsService.create(this.tutorial)
          .then((response) => {
            this.tutorial = Tutorial.toDisplayableTutorial(response.data);
            this.tutorials.push(this.tutorial);
            this.notifySuccessfulAction("Tutorial Created");
          });
    },

    updateTutorial() {
      this.tutorial = Tutorial.fromDisplayableTutorial(this.tutorial);
      this.tutorialsService
          .update(this.tutorial.id, this.tutorial)
          .then((response) => {
            this.tutorials[this.findIndexById(response.data.id)] =
                Tutorial.toDisplayableTutorial(response.data);
            this.notifySuccessfulAction("Tutorial Updated");
          });
    },

    deleteTutorial() {
      this.tutorialsService.delete(this.tutorial.id)
          .then(() => {
            this.tutorials = this.tutorials.filter((t) => t.id !== this.tutorial.id);
            this.deleteTutorialDialog = false;
            this.tutorial = {};
            this.notifySuccessfulAction("Tutorial Deleted");
          });
    },

    deleteSelectedTutorials() {
      this.selectedTutorials.forEach((tutorial) => {
        this.tutorialsService.delete(tutorial.id).then(() => {
          this.tutorials = this.tutorials.filter((t) => t.id !== this.tutorial.id);
        });
      });
      this.deleteTutorialsDialog = false;
      this.notifySuccessfulAction("Tutorials Deleted");
    }

    //#endregion Data Actions
  },
}
</script>

<template>
  <div class="tutorials">
    <div>
      <!-- Toolbar Section -->
      <pv-toolbar class="mb-4">
        <template #start>
          <pv-button class="mr-2" icon="pi pi-plus" label="New" severity="success" @click="onNewItem"/>
          <pv-button :disabled="!selectedTutorials || !selectedTutorials.length"
                     icon="pi pi-trash" label="Delete" severity="danger" @click="onConfirmDeleteSelected"/>
        </template>
        <template #end>
          <pv-button icon="pi pi-download" label="Export" severity="help" @click="onExportRequested($event)"></pv-button>
        </template>
      </pv-toolbar>

      <!-- Data Table Section -->
      <pv-data-table ref="dt" v-model:selection="selectedTutorials"
                     :filters="filters"
                     :paginator="true"
                     :rows="10"
                     :rowsPerPageOptions="[5, 10, 25]"
                     :value="tutorials"
                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tutorials"
                     dataKey="id"
                     paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                     responsiveLayout="scroll">
        <template #header>
          <div class="table-header gap-2 align-items-center justify-content-between">
            <h4 class="m-0">Manage Tutorials</h4>
            <span class="p-input-icon-left">
              <i class="pi pi-search"/>&nbsp;
              <pv-input-text v-model="filters['global'].value" placeholder="Search..."/>
            </span>
          </div>
        </template>

        <pv-column :exportable="false" selectionMode="multiple" style="width: 3rem"/>
        <pv-column :sortable="true" field="id" header="Id" style="min-width: 12rem"/>
        <pv-column :sortable="true" field="title" header="Title" style="min-width: 16rem"/>
        <pv-column :sortable="true" field="description" header="Description" style="min-width: 16rem"/>
        <pv-column :sortable="true" field="status" header="Status" style="min-width: 12rem">
          <template #body="slotProps">
            <pv-tag :severity="getSeverity(slotProps.data.status)" :value="slotProps.data.status"/>
          </template>
        </pv-column>
        <pv-column :exportable="false" style="min-width: 8rem">
          <template #body="slotProps">
            <pv-button class="mr-2" icon="pi pi-pencil" outlined rounded @click="onEditItemRequested(slotProps.data)"></pv-button>
            <pv-button icon="pi pi-trash" outlined rounded severity="danger" @click="onDeleteItemRequested(slotProps.data)"></pv-button>
          </template>
        </pv-column>
      </pv-data-table>

      <!-- Add/Edit Tutorial Dialog -->
      <tutorial-item-create-and-edit-dialog :statuses="statuses" :tutorial="tutorial" v-bind:visible="tutorialDialog"
                                            v-on:cancel="onAddOrUpdateItemCancel"
                                            v-on:save="onSaveItem"/>

      <!-- Delete Selected Tutorial Confirmation Dialog -->
      <tutorial-catalogue-item-delete-confirmation-dialog :item="tutorial" v-bind:visible="deleteTutorialDialog"
                                                          @cancel="onDeleteItemCancel"
                                                          v-on:confirm="onDeleteItemConfirm"/>

      <!-- Delete Selected Tutorials Confirmation Dialog -->
      <tutorial-subset-delete-confirmation-dialog :subset="selectedTutorials" v-bind:visible="deleteTutorialsDialog"
                                                  v-on:cancel="onDeleteSubsetCancel"
                                                  v-on:confirm="onDeleteSubsetConfirm"/>

    </div>
  </div>
</template>

<style scoped>
</style>